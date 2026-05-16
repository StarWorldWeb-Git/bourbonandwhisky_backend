import {
  getAllPostsService,
  getPostBySlugService,
  getPostByIdService,
  searchPostsByKeywordService,
} from "./blog.service.js";


export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const data = await getAllPostsService({
      page: Number(page),
      limit: Number(limit),
      
    });

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data,
    });
  } catch (error) {
    console.error("[getAllPosts]", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await getPostBySlugService(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found for slug: "${slug}"`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error("[getPostBySlug]", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ success: false, message: "Valid post ID required" });
    }

    const post = await getPostByIdService(Number(postId));

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found with ID: ${postId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error("[getPostById]", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const searchByKeyword = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;

    if (!keyword?.trim()) {
      return res.status(400).json({
        success: false,
        message: "keyword query parameter is required",
      });
    }

    const data = await searchPostsByKeywordService(keyword.trim(), {
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success: true,
      message: `Search results for "${keyword}"`,
      data,
    });
  } catch (error) {
    console.error("[searchByKeyword]", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};