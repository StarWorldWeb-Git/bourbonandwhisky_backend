
import { prisma } from "../../../lib/prisma.js";


export const getManufactureMeta = async (req, res) => {
  try {
    const { identifier } = req.params;
    const languageId = 1;

    let manufacturerId = null;
    const isNumeric = /^\d+$/.test(identifier);

    if (isNumeric) {
      manufacturerId = parseInt(identifier);
    } else {
      const seoUrl = await prisma.uvki_seo_url.findFirst({
        where: {
          keyword: identifier,
          store_id: 0,
          language_id: languageId,
        }
      });

      if (seoUrl?.query?.startsWith('manufacturer_id=')) {
        manufacturerId = parseInt(seoUrl.query.split('manufacturer_id=')[1]);
      }
    }

    if (!manufacturerId) return res.status(404).json({ message: 'Manufacturer not found' });

    const meta = await prisma.uvki_manufacturer_description.findFirst({
      where: {
        manufacturer_id: manufacturerId,
        language_id: languageId,
      },
      select: {
        meta_title: true,
        meta_description: true,
        meta_keyword: true,
      },
    });

    if (!meta) return res.status(404).json({ message: 'Meta not found' });

    res.json(meta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};