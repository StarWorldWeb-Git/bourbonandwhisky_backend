import { Router } from "express";
import {
  getAllPosts,
  getPostBySlug,
  getPostById,
  searchByKeyword,
} from "./blog.controller.js";

const blogRoute = Router();

blogRoute.get("/posts/:slug", getPostBySlug);
blogRoute.get("/posts", getAllPosts);
blogRoute.get("/search", searchByKeyword);

export default blogRoute;