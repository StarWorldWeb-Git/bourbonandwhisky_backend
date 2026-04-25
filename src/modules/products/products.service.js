import { prisma } from "../../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/parsePostiveInt.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const PAPPY_12_YR_PRODUCT_ID = 436;
const PAPPY_12_YR_LANGUAGE_ID = 1;
const PAPPY_12_YR_DESCRIPTION =
  `&lt;h2&gt;&lt;span style=&quot;font-size: 18px;&quot;&gt;Pappy Van Winkle's 12 Years Old Family Reserve&lt;/span&gt;&lt;/h2&gt;&lt;p&gt;&lt;span id=&quot;docs-internal-guid-ca761a28-7fff-e1c2-8130-a7bae297660d&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Pappy Van Winkle's Kentucky Straight Bourbon Whiskey serves the perfect combination of age and proof. The combination of 12 years of aging and a medium proof of 90.4 seems to be perfectly balanced, resulting in a very pleasant whiskey. As an after-dinner drink, this fine bourbon can compete with any great cognac. This bourbon is legendary, smooth, and sweet at the core, with little accents of spice and oak dancing along with each sip. Approachable in character, it's a great expression for novices and seasoned drinkers who share a penchant for well-balanced whiskeys. Versatile yet serves a bigger whale of time when temperatures drop in biting cold seasons!&lt;/span&gt;&lt;/span&gt;&lt;/p&gt;&lt;h3&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline; font-size: 16px;&quot;&gt;Tasting Profile:&lt;/span&gt;&lt;/h3&gt;&lt;ul style=&quot;margin-top: 0px; margin-bottom: 0px; padding-inline-start: 48px;&quot;&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 12pt; margin-bottom: 0pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Aromas:&lt;/span&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt; Sun-kissed fruits, dark spices, caramel, hints of vanilla and oak&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Taste Notes:&lt;/span&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt; Gentle sweetness, hints of butterscotch, baking spices, dried fruit, oak char&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Mouthfeel:&lt;/span&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt; Smooth, medium-bodied with a creamy texture&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 0pt; margin-bottom: 12pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Finish:&lt;/span&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Long and warming, with lingering notes of oak, spice, and caramel&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;/ul&gt;&lt;h3&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline; font-size: 16px;&quot;&gt;Serving Suggestions:&lt;/span&gt;&lt;/h3&gt;&lt;ul style=&quot;margin-top: 0px; margin-bottom: 0px; padding-inline-start: 48px;&quot;&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 12pt; margin-bottom: 0pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Neat (sipping straight)&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 0pt; margin-bottom: 0pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;On the rocks (with ice)&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;li dir=&quot;ltr&quot; aria-level=&quot;1&quot; style=&quot;list-style-type: disc; font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;p dir=&quot;ltr&quot; role=&quot;presentation&quot; style=&quot;line-height: 1.38; margin-top: 0pt; margin-bottom: 12pt;&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;In a classic cocktail like the Old Fashioned or Manhattan&lt;/span&gt;&lt;/p&gt;&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;&lt;span id=&quot;docs-internal-guid-ca761a28-7fff-e1c2-8130-a7bae297660d&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;span id=&quot;docs-internal-guid-6104f6d9-7fff-3959-6b9e-c79a021a02ef&quot;&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;&lt;b&gt;Potential for Aging:&lt;/b&gt; &lt;/span&gt;&lt;span style=&quot;font-variant-ligatures: normal; font-variant-alternates: normal; font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-position: normal; vertical-align: baseline;&quot;&gt;Pappy Van Winkle's 12 Year is already a mature bourbon and is not intended for further aging. It's bottled at peak flavor and complexity.&lt;/span&gt;&lt;/span&gt;&lt;br&gt;&lt;/span&gt;&lt;/span&gt;&lt;br&gt;&lt;/p&gt;`;


const htmlToPlainText = (input = "") => {
  if (!input) return "";

  const decoded = input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

  return decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|h5|h6|li|ul|ol)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const  listProducts = async (query) => {
  const page = parsePositiveInt(query.page, 1);
  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  const searchText = (query.q ?? "").toString().trim();
  const languageId = parsePositiveInt(query.language_id, 1);

  const where = searchText
    ? {
      OR: [
        { model: { contains: searchText } },
        { sku: { contains: searchText } },
        { upc: { contains: searchText } },
      ],
    }
    : {};
  const [items, total] = await Promise.all([
    prisma.uvki_product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { product_id: "desc" },
      select: {
        product_id: true,
        model: true,
        sku: true,
        price: true,
        status: true,
        image: true,
        quantity: true,
        uvki_product_description: {
          where: { language_id: languageId },
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.uvki_product.count({ where }),
  ]);


  const flatItems = items.map(({ uvki_product_description, ...product }) => ({
    ...product,
    name: uvki_product_description[0]?.name ?? null,
  }));

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items: flatItems,
  };

}

export const parseProductId = (idParam) => {
  return parsePositiveInt(idParam, 0);
};

export const getProductById = async (productId, languageId = 1) => {
  const product = await prisma.uvki_product.findUnique({
    where: { product_id: productId },
    select: {
      price: true,
      model: true,
      sku: true,
      upc: true,
      status: true,
      image: true,
      quantity: true,
      manufacturer_id:true
    },
  });

  if (!product) return null;
  const [desc, productImages,manufacturer] = await Promise.all([
   
    prisma.uvki_product_description.findFirst({
      where: {
        product_id: productId,
        language_id: languageId,
      },
    }),
    prisma.uvki_product_image.findMany({
      where: { product_id: productId },
      select: { image: true },
      orderBy: { sort_order: "asc" },
    }),
    prisma.uvki_manufacturer.findFirst({
      where:{manufacturer_id : product?.manufacturer_id },
      select:{ image:true}
    })
  ]);
  
  return {
    price: product.price,
    model: product.model,
    sku: product.sku,
    upc: product.upc,
    status: product.status,
    image: product.image,
    images: productImages?.map((img) => img.image) ?? [],
    quantity: product.quantity,
    name: desc?.name ?? null,
    description: desc ? htmlToPlainText(desc.description) : null,
    meta_title: desc?.meta_title ?? null,
    meta_description: desc?.meta_description ?? null,
    meta_keyword: desc?.meta_keyword ?? null,
    tag: desc?.tag ?? null,
    brandImg: manufacturer?.image ?? null,
  };
}
