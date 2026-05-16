import { prisma } from "../../../lib/prisma.js";



export const getBlogMeta = async (req, res) => {
    try {
        const { identifier } = req.params;
        const languageId = 1;

        const meta = await prisma.uvki_journal3_blog_post_description.findFirst({
            where: {
                keyword: identifier,
                language_id: languageId,
            },
            select: {
                meta_title: true,
                meta_description: true,
                meta_keywords: true,
            },
        });

        if (!meta) return res.status(404).json({ message: 'Meta not found' });

        res.json(meta);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};