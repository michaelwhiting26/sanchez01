import { describe, expect, it } from "vitest";
import {
  AttributionSchema,
  hasCampaignSignal,
  mergeAttribution,
  parseTouch,
  TouchSchema,
} from "./index";

const at = new Date("2026-09-28T09:00:00.000Z");

describe("parseTouch", () => {
  it("extracts UTM, click ids and ambassador code; drops the query string", () => {
    const t = parseTouch({
      url: "https://sanchezboxing.com/en/configure/bag?utm_source=Instagram&utm_medium=Paid_Social&utm_campaign=Launch%20AU&utm_term=heavy+bag&utm_content=reel1&gclid=Cj0KCQ-abc_123&fbclid=IwAR0xyz&amb=jesse01&email=bob@example.com",
      referrer: "https://l.instagram.com/some/path?u=secret",
      at,
    });
    expect(t).toEqual({
      at: at.toISOString(),
      landingPath: "/en/configure/bag",
      referrer: "https://l.instagram.com/some/path",
      utm: {
        source: "instagram",
        medium: "paid_social",
        campaign: "Launch AU",
        term: "heavy bag",
        content: "reel1",
      },
      gclid: "Cj0KCQ-abc_123",
      fbclid: "IwAR0xyz",
      ambassadorCode: "JESSE01",
    });
    expect(TouchSchema.safeParse(t).success).toBe(true);
    expect(JSON.stringify(t)).not.toContain("example.com");
  });

  it("returns an empty touch for a direct visit", () => {
    const t = parseTouch({ url: "/", at });
    expect(hasCampaignSignal(t)).toBe(false);
    expect(t.referrer).toBeNull();
  });

  it("ignores self-referrals, non-http referrers and malformed input", () => {
    expect(
      parseTouch({
        url: "https://sanchezboxing.com/a",
        referrer: "https://sanchezboxing.com/b",
        at,
      }).referrer,
    ).toBeNull();
    expect(
      parseTouch(
        { url: "/a", referrer: "https://sanchezboxing.com/b", at },
        { siteHostname: "sanchezboxing.com" },
      ).referrer,
    ).toBeNull();
    expect(parseTouch({ url: "/a", referrer: "javascript:alert(1)", at }).referrer).toBeNull();
    expect(parseTouch({ url: "/a", referrer: "not a url", at }).referrer).toBeNull();
    expect(parseTouch({ url: "http://[bad", at }).landingPath).toBe("/");
  });

  it("sanitises values: trims, caps length, rejects bad click ids and ambassador codes", () => {
    const long = "x".repeat(500);
    const t = parseTouch({
      url: `/?utm_campaign=${long}&utm_source=%20%20&gclid=bad<script>&amb=a`,
      at,
    });
    expect(t.utm.campaign).toHaveLength(200);
    expect(t.utm.source).toBeNull();
    expect(t.gclid).toBeNull();
    expect(t.ambassadorCode).toBeNull();
  });

  it("supports configurable ambassador params in priority order", () => {
    expect(
      parseTouch({ url: "/?partner=ab-12&ref=zz99", at }, { ambassadorParams: ["partner", "ref"] })
        .ambassadorCode,
    ).toBe("AB-12");
    expect(parseTouch({ url: "/?ref=zz99", at }).ambassadorCode).toBe("ZZ99");
  });
});

describe("first/last touch", () => {
  const paid = parseTouch({ url: "/?utm_source=google&gclid=abc", at });
  const direct = parseTouch({ url: "/shop", at: new Date("2026-09-29T00:00:00Z") });
  const partner = parseTouch({ url: "/?amb=coach7", at: new Date("2026-09-30T00:00:00Z") });

  it("first visit sets both touches", () => {
    expect(mergeAttribution(null, paid)).toEqual({ firstTouch: paid, lastTouch: paid });
  });
  it("direct visits never overwrite last touch", () => {
    const a = mergeAttribution(mergeAttribution(null, paid), direct);
    expect(a.lastTouch).toBe(paid);
  });
  it("a later campaign touch updates last touch but never first", () => {
    const a = mergeAttribution(mergeAttribution(mergeAttribution(null, paid), direct), partner);
    expect(a.firstTouch).toBe(paid);
    expect(a.lastTouch).toBe(partner);
    expect(AttributionSchema.safeParse(a).success).toBe(true);
  });
  it("a direct first visit is still recorded as first touch", () => {
    const a = mergeAttribution(mergeAttribution(null, direct), paid);
    expect(a.firstTouch).toBe(direct);
    expect(a.lastTouch).toBe(paid);
  });
});
