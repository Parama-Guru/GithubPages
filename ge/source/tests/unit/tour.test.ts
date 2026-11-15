import { describe, expect, it } from "vitest";
import { chapterAt, chapterProgress, resumeChapter } from "@/app/tour";
import { chapters } from "@/timeline/chapters";
import { sampleJourney, zoneAt } from "@/world/path";

describe("tour memory", () => {
  it("takes the last chapter whose top has reached the middle of the viewport", () => {
    const tops = [0, 1000, 2600];
    expect(chapterAt(tops, -50)).toBe(0);
    expect(chapterAt(tops, 999)).toBe(0);
    expect(chapterAt(tops, 1000)).toBe(1);
    expect(chapterAt(tops, 9000)).toBe(2);
    expect(chapterAt([], 500)).toBe(0);
  });

  it("resumes any chapter after the first, which is the start of the tour", () => {
    expect(resumeChapter("clients")).toBe("clients");
    expect(resumeChapter(chapters[0]?.id ?? "")).toBeNull();
    expect(resumeChapter("nowhere")).toBeNull();
    expect(resumeChapter(null)).toBeNull();
  });

  it("aims the camera into each chapter's own room before the home page is measured", () => {
    for (const chapter of chapters) {
      const { progress, ranges } = chapterProgress(chapter.id);
      expect(zoneAt(sampleJourney(ranges, progress).position[2]), chapter.id).toBe(chapter.zone);
    }
  });
});
