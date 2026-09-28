import type { Choice, Condition, Label } from "../schema";

export const l = (en: string): Label => ({ en });
export const choice = (
  value: string,
  en: string,
  extra: Partial<Pick<Choice, "attributes" | "availableWhen">> = {},
): Choice => ({
  value,
  label: l(en),
  ...extra,
});
export const whenIn = (option: string, values: string[]): Condition => ({ option, in: values });
