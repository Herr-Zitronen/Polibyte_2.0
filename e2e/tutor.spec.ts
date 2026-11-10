// H7.2 · Tutor responsable. /lab/tutor/ fija un tutor completo; /lab/tutor-none/ no tiene tutor.
import { expect, test } from "@playwright/test";

test("sección Tutor responsable con cargo, facultad, descripción y mailto", async ({ page }) => {
  await page.goto("/lab/tutor/");
  const s = page.locator("#tutor");
  await expect(s.getByText("Tutor responsable", { exact: true })).toBeVisible();
  await expect(s.getByRole("heading", { level: 2 })).toHaveText("Carlos Ramírez");
  await expect(s.locator(".pb-tag")).toHaveText(["Docente titular", "Facultad de Informática y Electrónica"]);
  await expect(s.locator(".pb-tutor-about")).toHaveText("Acompaña a la directiva y avala las actividades.");
  await expect(s.getByRole("link", { name: "tutor@example.com" })).toHaveAttribute(
    "href",
    "mailto:tutor@example.com",
  );
});

test("sin tutor no hay sección", async ({ page }) => {
  await page.goto("/lab/tutor-none/");
  await expect(page.locator("#directiva")).toBeVisible();
  await expect(page.locator("#tutor")).toHaveCount(0);
});

test("390: foto arriba y texto debajo (se apila)", async ({ page }) => {
  test.skip(page.viewportSize()!.width !== 390, "solo 390");
  await page.goto("/lab/tutor/");
  const photo = (await page.locator("#tutor .pb-tutor-photo").boundingBox())!;
  const name = (await page.locator("#tutor h2").boundingBox())!;
  expect(name.y).toBeGreaterThan(photo.y + photo.height - 1);
});
