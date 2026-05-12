import { prisma } from "../../../lib/prisma.js";



export const getCategoriMeta = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("dssf",req.params)
    const meta = await prisma.uvki_category_description.findFirst({
      where: {
        category_id: parseInt(id),
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