import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { buildPersonExportZip } from "./build-export-zip";

describe("buildPersonExportZip", () => {
  it("creates zip with category json files", () => {
    const categories = {
      profile: { id: "p-1", firstName: "Leo" },
      member: null,
      consent: [],
      relationships: [],
      leads: [],
    };

    const zip = buildPersonExportZip(categories);
    const files = unzipSync(zip);

    expect(Object.keys(files).sort()).toEqual([
      "consent.json",
      "leads.json",
      "member.json",
      "profile.json",
      "relationships.json",
    ]);

    const profile = JSON.parse(new TextDecoder().decode(files["profile.json"])) as {
      firstName: string;
    };
    expect(profile.firstName).toBe("Leo");
  });
});
