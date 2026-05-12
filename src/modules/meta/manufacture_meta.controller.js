
import { prisma } from "../../../lib/prisma.js";


export const getManufactureMeta = async (req, res) => {
  try {
    const { id } = req.params;

    const meta = await prisma.uvki_manufacturer_description.findFirst({
      where: {
        manufacturer_id: parseInt(id),
        language_id: 1,
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