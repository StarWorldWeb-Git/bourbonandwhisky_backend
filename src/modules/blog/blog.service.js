import { prisma } from "../../../lib/prisma.js";

const toSlug = (str) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export const getAllPostsService = async ({ page = 1, limit = 10, } = {}) => {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        prisma.uvki_journal3_blog_post.findMany({
            where: { status: true },
            skip,
            take: limit,
            orderBy: [{ sort_order: "asc" }, { date_created: "desc" }],
            include: {
                uvki_journal3_blog_post_description: {
                    where: { language_id: 1 },
                    select: {
                        name: true,
                        description: true,
                        tags: true,
                        keyword: true,
                        meta_title: true,
                        meta_keywords: true,
                        meta_description: true,
                    },
                },
            },
        }),
        prisma.uvki_journal3_blog_post.count({ where: { status: true } }),
    ]);

    const formatted = posts.map((post) => {
        const desc = post.uvki_journal3_blog_post_description?.[0] ?? {};


        return {
            post_id: post.post_id,
            author_id: post.author_id,
            image: post.image,
            comments: post.comments,
            status: post.status,
            sort_order: post.sort_order,
            date_created: post.date_created,
            date_updated: post.date_updated,
            title: desc.name ?? null,
            content: desc.description ?? null,
            slug: desc.keyword ?? null,
            meta_title: desc.meta_title ?? null,
            meta_keywords: desc.meta_keywords ?? null,
            meta_description: desc.meta_description ?? null,
        };
    });

    return {
        posts: formatted,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};


export const getPostBySlugService = async (slug) => {
    const desc = await prisma.uvki_journal3_blog_post_description.findFirst({
        where: {
            language_id: 1,
            keyword: slug,
        },
        select: {
            post_id: true,
            name: true,
            description: true,
            tags: true,
            keyword: true,
        },
    });

    if (!desc) return null;

    const post = await prisma.uvki_journal3_blog_post.findFirst({
        where: {
            post_id: desc.post_id,
            status: true,
        },
    });

    if (!post) return null;

    return {
        post_id: post.post_id,
        author_id: post.author_id,
        image: post.image,
        comments: post.comments,
        status: post.status,
        sort_order: post.sort_order,
        date_created: post.date_created,
        date_updated: post.date_updated,
        title: desc.name,
        content: desc.description,
        slug: desc.keyword,

    };
};


export const getPostByIdService = async (postId) => {
    const post = await prisma.uvki_journal3_blog_post.findUnique({
        where: { post_id: postId },
        include: {
            uvki_journal3_blog_post_description: {
                where: { language_id: 1 },
                select: {
                    name: true,
                    description: true,
                    tags: true,
                    keyword: true,
                    meta_title: true,
                    meta_keywords: true,
                    meta_description: true,
                },
            },
        },
    });

    if (!post) return null;

    const desc = post.uvki_journal3_blog_post_description?.[0] ?? {};
    return {
        post_id: post.post_id,
        author_id: post.author_id,
        image: post.image,
        comments: post.comments,
        status: post.status,
        sort_order: post.sort_order,
        date_created: post.date_created,
        date_updated: post.date_updated,
        title: desc.name ?? null,
        content: desc.description ?? null,
        slug: desc.keyword ?? null,
    };
};


export const searchPostsByKeywordService = async (keyword, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;

    const whereCondition = {
        language_id: 1,
        OR: [
            { name: { contains: keyword } },
            { tags: { contains: keyword } },
            { keyword: { contains: keyword } },
            { meta_keywords: { contains: keyword } },
            { meta_description: { contains: keyword } },
        ],
    };

    const [descResults, total] = await Promise.all([
        prisma.uvki_journal3_blog_post_description.findMany({
            where: whereCondition,
            skip,
            take: limit,
            select: {
                post_id: true,
                name: true,
                description: true,
                tags: true,
                keyword: true,
                meta_title: true,
                meta_keywords: true,
                meta_description: true,
            },
        }),
        prisma.uvki_journal3_blog_post_description.count({ where: whereCondition }),
    ]);

    const postIds = descResults.map((d) => d.post_id);

    const posts = await prisma.uvki_journal3_blog_post.findMany({
        where: {
            post_id: { in: postIds },
            status: true,
        },
    });

    const postMap = Object.fromEntries(posts.map((p) => [p.post_id, p]));

    const formatted = descResults
        .filter((desc) => postMap[desc.post_id])
        .map((desc) => {
            const post = postMap[desc.post_id];
            const slug = desc.tags || (desc.name ? toSlug(desc.name) : `post-${post.post_id}`);

            return {
                post_id: post.post_id,
                author_id: post.author_id,
                image: post.image,
                comments: post.comments,
                status: post.status,
                sort_order: post.sort_order,
                date_created: post.date_created,
                date_updated: post.date_updated,
                title: desc.name,
                content: desc.description,
                slug,
                keyword: desc.keyword,
                meta_title: desc.meta_title,
                meta_keywords: desc.meta_keywords,
                meta_description: desc.meta_description,
                keywords: desc.meta_keywords
                    ? desc.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)
                    : [],
            };
        });

    return {
        keyword,
        posts: formatted,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};