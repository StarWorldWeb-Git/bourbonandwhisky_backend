import { prisma } from "../../../lib/prisma.js";

export const getShippingRate = async (req, res) => {
  try {
    const setting = await prisma.uvki_setting.findFirst({
      where: {
        code: "shipping_flat",
        key: "shipping_flat_cost",
      },
    });
 
    const rate = setting ? parseFloat(setting.value) : 20;
 
    res.status(200).json({
      success: true,
      data: { shipping_rate: rate },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};