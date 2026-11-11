// Photographs available on the site, by slot. A slot with no file falls
// back to the drawn treatment, so the pages never show a broken image.
export const FIELD_PHOTOS: Record<string, { src: string; alt: string }> = {
  hr: { src: "/photos/field-hr.jpg", alt: "An HR coordinator hands a new hire their badge and paperwork across a desk" },
  healthcare: { src: "/photos/field-healthcare.jpg", alt: "A care assistant in scrubs updates a chart at a nurses' station" },
  it: { src: "/photos/field-it.jpg", alt: "A help-desk technician with a headset works on an opened computer" },
};

export const PHOTOS = {
  evening: { src: "/photos/evening.jpg", width: 2000, height: 845, alt: "A kitchen table at night: a laptop, a folder of certificates, a work badge and a mug of tea" },
  evaluator: { src: "/photos/evaluator.jpg", width: 2000, height: 1507, alt: "A faculty evaluator reads a printed portfolio at her desk" },
};
