require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { User, Category, Product, Coupon, Review, Cart, Wishlist, Order } = require('../models');

const sampleImages = {
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80'
  ],
  donuts: [
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1626094309830-abbb0c97da56?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583338917451-face2751d8d5?auto=format&fit=crop&w=1200&q=80'
  ],
  drinks: [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=80'
  ],
  combos: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  ]
};

const pizzaSizes = [
  { name: 'Personal (8")', priceAdjustment: 0, isDefault: true },
  { name: 'Medium (12")', priceAdjustment: 5.50, isDefault: false },
  { name: 'Large (16")', priceAdjustment: 9.75, isDefault: false },
];

const pizzaToppings = [
  { name: 'Extra Mozzarella Fior di Latte', price: 2.25, category: 'cheese' },
  { name: 'Hot Honey Drizzle', price: 1.50, category: 'sauce' },
  { name: 'Smoked Pepperoni', price: 2.75, category: 'meat' },
  { name: 'Sautéed Garlic Mushrooms', price: 1.80, category: 'veggie' },
  { name: 'Kalamata Olives', price: 1.50, category: 'veggie' },
  { name: 'Grilled Herb Chicken', price: 3.00, category: 'meat' },
];

const donutFlavors = [
  { name: 'Extra Warm Valrhona Ganache', price: 1.25, category: 'glaze' },
  { name: 'Rainbow Birthday Sprinkles', price: 0.75, category: 'topping' },
  { name: 'Gold Leaf Flakes', price: 2.00, category: 'premium' },
  { name: 'Toasted Almond Slivers', price: 1.00, category: 'topping' },
  { name: 'Caramel Fudge Core', price: 1.50, category: 'filling' },
];

const donutBoxes = [
  { name: 'Single Donut', priceAdjustment: 0, isDefault: true },
  { name: 'Box of 4 (Save 10%)', priceAdjustment: 9.50, isDefault: false },
  { name: 'Party Box of 12 (Save 25%)', priceAdjustment: 24.00, isDefault: false },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sweet_and_savory';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to database: ${mongoUri}`);

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Chef & Manager Matteo',
      email: 'admin@sweetandsavory.com',
      password: 'AdminPassword123!',
      phone: '+20 100 123 4567',
      address: {
        street: '14 Al-Ahram Blvd, Suite 300',
        city: 'Cairo',
        state: 'Cairo Governorate',
        postalCode: '11511',
        country: 'Egypt'
      },
      role: 'admin',
      avatar: 'https://myquickurl.com/cheerlives.com/23-cheerlives_serenestitch_20241014214412.webp',
    });

    const demoUser = await User.create({
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      password: 'UserPassword123!',
      phone: '+20 111 987 6543',
      address: {
        street: '72 Nile View Promenade, Apt 4B',
        city: 'Zamalek, Cairo',
        state: 'Cairo Governorate',
        postalCode: '11211',
        country: 'Egypt'
      },
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seed] Created Admin (admin@sweetandsavory.com) and Demo User (sarah@example.com)');

    // 2. Seed Categories
    const categories = await Category.create([
      {
        name: 'Artisan Pizza',
        slug: 'pizza',
        description: '48-hour slow-fermented dough, stone-baked with Italian San Marzano tomatoes and artisanal cheeses.',
        image: sampleImages.pizza[0],
        icon: '🍕',
        badgeText: 'Stone-Baked',
        order: 1,
      },
      {
        name: 'Handcrafted Donuts',
        slug: 'donuts',
        description: 'Brioche-style fluffy fried rings hand-dipped in small-batch glazes and filled with house creams.',
        image: sampleImages.donuts[0],
        icon: '🍩',
        badgeText: 'Fresh Glazed',
        order: 2,
      },
      {
        name: 'Combo Meals',
        slug: 'combos',
        description: 'Why settle for sweet OR savory? Pair our hottest pizzas with melt-in-mouth donuts & cold drinks.',
        image: sampleImages.combos[0],
        icon: '🔥',
        badgeText: 'Best Value',
        order: 3,
      },
      {
        name: 'Chilled Drinks',
        slug: 'drinks',
        description: 'House-infused botanicals, sparkling sodas, and cold brews crafted to complement rich flavors.',
        image: sampleImages.drinks[0],
        icon: '🥤',
        badgeText: 'Refreshing',
        order: 4,
      }
    ]);

    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c; });
    console.log('[Seed] Created 4 Categories');

    // 3. Seed Products
    const productsData = [
      // PIZZAS
      {
        name: 'Margherita Supreme',
        nameAr: 'مارجريتا سوبريم الإيطالية',
        slug: 'margherita-supreme',
        description: 'The golden standard of Neapolitan pizza. 48-hour cold-fermented sourdough base, crushed San Marzano DOP tomatoes, torn Fior di Latte mozzarella, fresh Genovese sweet basil, and Sicilian cold-pressed extra virgin olive oil.',
        descriptionAr: 'المعيار الذهبي للبيتزا النابولية. عجينة مخمرة 48 ساعة، طماطم سان مارزانو الإيطالية، جبنة فيور دي لاتي، وريحان طازج مع زيت زيتون بكر ممتاز.',
        shortDescription: 'San Marzano tomatoes, Fior di Latte, fresh basil & EVOO on sourdough crust.',
        category: catMap['pizza']._id,
        categorySlug: 'pizza',
        images: [sampleImages.pizza[0], sampleImages.pizza[1]],
        price: 13.99,
        discountPrice: 11.99,
        rating: 4.9,
        reviewCount: 48,
        stock: 60,
        availableSizes: pizzaSizes,
        availableToppings: pizzaToppings,
        ingredients: ['Sourdough flour', 'San Marzano tomatoes', 'Fior di Latte mozzarella', 'Fresh basil', 'EVOO', 'Sea salt'],
        nutritionalInfo: { calories: 780, protein: '34g', carbs: '88g', fat: '28g' },
        preparationTime: '15-20 min',
        isFeatured: true,
        isPopular: true,
        badgeText: "Chef's Signature",
        tags: ['pizza', 'vegetarian', 'bestseller', 'classic', 'neapolitan'],
      },
      {
        name: 'Smoky Pepperoni Blast',
        nameAr: 'سموكي بيبروني بلاست',
        slug: 'smoky-pepperoni-blast',
        description: 'Curated for real meat lovers. Double artisan beef & pepperoni cups that crisp up with golden rims, smoked provolone, creamy aged mozzarella, finished with a generous drizzle of hot habanero-infused honey.',
        descriptionAr: 'لعشاق اللحوم الحقيقيين. طبقات مضاعفة من البيبروني المقرمش، جبنة البروفولون المدخنة والموزاريلا الغنية، مع لمسة عسل حار فاخر.',
        shortDescription: 'Crisp cupping pepperoni, aged mozzarella, hot honey drizzle & cracked chili.',
        category: catMap['pizza']._id,
        categorySlug: 'pizza',
        images: [sampleImages.pizza[1], sampleImages.pizza[0]],
        price: 16.50,
        discountPrice: null,
        rating: 5.0,
        reviewCount: 92,
        stock: 55,
        availableSizes: pizzaSizes,
        availableToppings: pizzaToppings,
        ingredients: ['Artisan pepperoni', 'Aged mozzarella', 'Smoked provolone', 'Spicy blossom honey', 'Chili flakes'],
        nutritionalInfo: { calories: 920, protein: '42g', carbs: '90g', fat: '44g' },
        preparationTime: '18-22 min',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Top Rated',
        tags: ['pizza', 'meat', 'spicy', 'pepperoni', 'bestseller'],
      },
      {
        name: 'BBQ Truffle Chicken',
        nameAr: 'دجاج باربيكيو بالكمأة',
        slug: 'bbq-truffle-chicken',
        description: 'Tender sous-vide grilled chicken breast glazed in our signature hickory smoked BBQ sauce, combined with sautéed wild cremini mushrooms, smoked scamorza cheese, and a delicate white truffle oil mist.',
        descriptionAr: 'قطع صدور دجاج مشوية طرية بصوص الباربيكيو المدخن، مع فطر الكريمني المشوّح، جبنة سكامورزا وزيت الكمأة البيضاء الفاخر.',
        shortDescription: 'Sous-vide chicken, hickory BBQ glaze, wild mushrooms & white truffle oil.',
        category: catMap['pizza']._id,
        categorySlug: 'pizza',
        images: [sampleImages.pizza[2], sampleImages.pizza[3]],
        price: 17.25,
        discountPrice: 15.50,
        rating: 4.8,
        reviewCount: 37,
        stock: 40,
        availableSizes: pizzaSizes,
        availableToppings: pizzaToppings,
        ingredients: ['Grilled chicken breast', 'Hickory BBQ sauce', 'Smoked scamorza', 'Wild mushrooms', 'Truffle oil'],
        nutritionalInfo: { calories: 860, protein: '48g', carbs: '86g', fat: '32g' },
        preparationTime: '20-25 min',
        isFeatured: false,
        isPopular: true,
        badgeText: 'Popular',
        tags: ['pizza', 'chicken', 'bbq', 'truffle', 'gourmet'],
      },
      {
        name: 'Four Cheese Decadence',
        nameAr: 'أربعة أجبان فاخرة',
        slug: 'four-cheese-decadence',
        description: 'A creamy, rich masterpiece combining velvety Gorgonzola Dolce, creamy whole-milk ricotta dollops, sharp 24-month Parmigiano-Reggiano crisps, and stretchy Fior di Latte on a white garlic butter foundation.',
        descriptionAr: 'تحفة الجبن الغنية بمزيج الجورجونزولا الإيطالية، الريكوتا الطازجة، بارميزان 24 شهر، وموزاريلا فيور دي لاتي مع زبدة الثوم والأعشاب.',
        shortDescription: 'Gorgonzola, whipped ricotta, 24-mo Parmigiano & Fior di Latte on garlic cream.',
        category: catMap['pizza']._id,
        categorySlug: 'pizza',
        images: [sampleImages.pizza[3], sampleImages.pizza[4]],
        price: 15.99,
        discountPrice: null,
        rating: 4.7,
        reviewCount: 29,
        stock: 35,
        availableSizes: pizzaSizes,
        availableToppings: pizzaToppings,
        ingredients: ['Gorgonzola Dolce', 'Whole milk ricotta', 'Parmigiano-Reggiano', 'Fior di Latte', 'Garlic herb butter'],
        nutritionalInfo: { calories: 890, protein: '38g', carbs: '82g', fat: '46g' },
        preparationTime: '15-20 min',
        isFeatured: false,
        isPopular: false,
        badgeText: 'Cheese Lover',
        tags: ['pizza', 'cheese', 'vegetarian', 'decadent'],
      },
      {
        name: 'Spicy Diablo Fire',
        nameAr: 'سبايسي ديابلو الحارة',
        slug: 'spicy-diablo-fire',
        description: 'For those who crave serious heat. Calabrian chili spread, spicy pulled chicken, charred jalapeño rings, pickled red onion pearls, and a cool avocado-lime crema drizzle to balance the fire.',
        descriptionAr: 'لعشاق النكهات الحارة الحارقة. معجون فلفل كالابريا، دجاج مسحب حار، شرائح هلابينو مشوية، بصل مخلل وكريمة أفوكادو بالليمون.',
        shortDescription: 'Calabrian chili, spicy pulled chicken, charred jalapeños & avocado-lime crema.',
        category: catMap['pizza']._id,
        categorySlug: 'pizza',
        images: [sampleImages.pizza[4], sampleImages.pizza[1]],
        price: 16.75,
        discountPrice: 14.50,
        rating: 4.9,
        reviewCount: 44,
        stock: 45,
        availableSizes: pizzaSizes,
        availableToppings: pizzaToppings,
        ingredients: ['Spicy pulled chicken', 'Calabrian chili paste', 'Charred jalapeños', 'Avocado crema', 'Red onions'],
        nutritionalInfo: { calories: 840, protein: '40g', carbs: '85g', fat: '34g' },
        preparationTime: '18-22 min',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Extra Spicy',
        tags: ['pizza', 'spicy', 'hot', 'chicken'],
      },

      // DONUTS
      {
        name: 'Dark Cocoa Velvet Donut',
        nameAr: 'دونات كاكاو فيلفيت الداكنة',
        slug: 'dark-cocoa-velvet-donut',
        description: 'Fluffy brioche ring fried to golden perfection, coated in luscious 70% Valrhona single-origin dark chocolate ganache, sprinkled with roasted Ecuadorian cocoa nibs and edible 24K gold dust leaf.',
        descriptionAr: 'حلقة بريوش هشة ومقلية بلون ذهبي، مغطاة بجناش شوكولاتة فالرونا الداكنة 70%، وحبيبات كاكاو محمصة مع غبار الذهب عيار 24 قيراط.',
        shortDescription: '70% Valrhona dark chocolate glaze, crunchy cacao nibs & edible gold dust.',
        category: catMap['donuts']._id,
        categorySlug: 'donuts',
        images: [sampleImages.donuts[0], sampleImages.donuts[1]],
        price: 4.25,
        discountPrice: 3.75,
        rating: 5.0,
        reviewCount: 110,
        stock: 75,
        availableSizes: donutBoxes,
        availableFlavors: donutFlavors,
        ingredients: ['Brioche flour', 'French butter', 'Valrhona 70% chocolate', 'Cacao nibs', 'Pure cream', 'Gold leaf'],
        nutritionalInfo: { calories: 340, protein: '5g', carbs: '42g', fat: '18g' },
        preparationTime: 'Instant Ready',
        isFeatured: true,
        isPopular: true,
        badgeText: 'All-Time Favorite',
        tags: ['donuts', 'chocolate', 'dessert', 'bestseller', 'sweet'],
      },
      {
        name: 'Glazed Strawberry Blossom',
        nameAr: 'دونات الفراولة المزهرة',
        slug: 'glazed-strawberry-blossom',
        description: 'Vibrant and naturally sweet. Glazed with freshly pureed wild mountain strawberries and vanilla, topped with freeze-dried strawberry pearls and delicate curls of natural ruby chocolate.',
        descriptionAr: 'مبهجة وحلوة طبيعياً. مغطاة بجليز الفراولة الجبلية البرية النقية والفانيليا، مع رقائق شوكولاتة الروبي النادرة وقطع فراولة مقرمشة.',
        shortDescription: 'Wild mountain strawberry glaze, ruby chocolate curls & freeze-dried berry crunch.',
        category: catMap['donuts']._id,
        categorySlug: 'donuts',
        images: [sampleImages.donuts[1], sampleImages.donuts[2]],
        price: 4.00,
        discountPrice: null,
        rating: 4.8,
        reviewCount: 65,
        stock: 80,
        availableSizes: donutBoxes,
        availableFlavors: donutFlavors,
        ingredients: ['Wild strawberries', 'Ruby chocolate', 'Bourbon vanilla', 'Cane sugar glaze', 'Brioche dough'],
        nutritionalInfo: { calories: 310, protein: '4g', carbs: '44g', fat: '14g' },
        preparationTime: 'Instant Ready',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Berry Fresh',
        tags: ['donuts', 'strawberry', 'fruit', 'dessert', 'pink'],
      },
      {
        name: 'Madagascar Vanilla Bean Custard',
        nameAr: 'دونات كاسترد فانيليا مدغشقر',
        slug: 'madagascar-vanilla-bean-custard',
        description: 'Puffed pillow donut generously filled with house-made silky pastry cream infused with authentic speckled Madagascar vanilla beans, finished with an ultra-thin crackling crystalline sugar glaze.',
        descriptionAr: 'دونات محشوة بكريمة الكاسترد الحريرية المحضرة يدوياً بحبوب فانيليا مدغشقر الأصلية، ومغطاة بطبقة سكر كريستالية مقرمشة.',
        shortDescription: 'Filled with silky Madagascar vanilla custard and crowned with crackling glaze.',
        category: catMap['donuts']._id,
        categorySlug: 'donuts',
        images: [sampleImages.donuts[2], sampleImages.donuts[0]],
        price: 4.50,
        discountPrice: null,
        rating: 4.9,
        reviewCount: 52,
        stock: 65,
        availableSizes: donutBoxes,
        availableFlavors: donutFlavors,
        ingredients: ['Madagascar vanilla beans', 'Egg yolks', 'Organic whole milk', 'Butter glaze', 'Nutmeg'],
        nutritionalInfo: { calories: 360, protein: '6g', carbs: '46g', fat: '17g' },
        preparationTime: 'Instant Ready',
        isFeatured: false,
        isPopular: true,
        badgeText: 'Custard Filled',
        tags: ['donuts', 'vanilla', 'custard', 'filled', 'classic'],
      },
      {
        name: 'Salted Caramel Pecan Crunch',
        nameAr: 'كرانش كراميل مملح وبيكان',
        slug: 'salted-caramel-pecan-crunch',
        description: 'Rich amber salted butter caramel slowly simmered in copper pots, dipped generously over soft brioche, then showered with slow-roasted buttered Georgia pecans and Maldon sea salt flakes.',
        descriptionAr: 'كراميل زبدة مملح مطهو ببطء، مغطى بمكسرات البيكان المحمصة بالزبدة ورقائق ملح مالدون البحري.',
        shortDescription: 'Copper-kettle salted caramel, toasted Georgia pecans & Maldon sea salt crystals.',
        category: catMap['donuts']._id,
        categorySlug: 'donuts',
        images: [sampleImages.donuts[3], sampleImages.donuts[4]],
        price: 4.50,
        discountPrice: 3.99,
        rating: 4.9,
        reviewCount: 88,
        stock: 60,
        availableSizes: donutBoxes,
        availableFlavors: donutFlavors,
        ingredients: ['House salted caramel', 'Roasted pecans', 'Maldon sea salt', 'French butter', 'Dark muscovado'],
        nutritionalInfo: { calories: 380, protein: '5g', carbs: '45g', fat: '21g' },
        preparationTime: 'Instant Ready',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Chef Favorite',
        tags: ['donuts', 'caramel', 'pecan', 'nuts', 'salty-sweet'],
      },
      {
        name: 'Cookies & Cream Oreo Dream',
        nameAr: 'أوريو دريم كوكيز آند كريم',
        slug: 'cookies-and-cream-oreo-dream',
        description: 'Creamy white chocolate fondue glaze loaded with crunchy dark cookie crumbles, filled with an airy whipped cookies & cream mousse, topped with a mini whole Oreo cookie.',
        descriptionAr: 'جليز فوندو الشوكولاتة البيضاء مع فتات الكوكيز الداكنة المقرمشة، محشوة بموس الأوريو المخفوق مع قطعة بسكويت أوريو كاملة.',
        shortDescription: 'White chocolate fondue glaze, whipped Oreo mousse & chunky cookie crumble.',
        category: catMap['donuts']._id,
        categorySlug: 'donuts',
        images: [sampleImages.donuts[4], sampleImages.donuts[0]],
        price: 4.25,
        discountPrice: null,
        rating: 4.7,
        reviewCount: 41,
        stock: 50,
        availableSizes: donutBoxes,
        availableFlavors: donutFlavors,
        ingredients: ['Dark cocoa cookies', 'White Belgian chocolate', 'Vanilla whip', 'Sweet cream'],
        nutritionalInfo: { calories: 370, protein: '5g', carbs: '48g', fat: '19g' },
        preparationTime: 'Instant Ready',
        isFeatured: false,
        isPopular: false,
        badgeText: 'Kids & Teens Pick',
        tags: ['donuts', 'oreo', 'cookies', 'chocolate'],
      },

      // COMBOS
      {
        name: 'The Sweet & Savory Duo',
        nameAr: 'كومبو دويتو سويت آند سافوري',
        slug: 'the-sweet-and-savory-duo',
        description: 'The iconic craving match! 1 Medium Gourmet Pizza of your choice (Margherita or Pepperoni) paired with 2 Artisan Donuts of your choice. Save 20% compared to individual order.',
        descriptionAr: 'المزيج المثالي لعشاق الطعم المالح والحلو! بيتزا متوسطة من اختيارك مع قطعتين دوناتس فاخرة، مع توفير 20% مقارنة بالطلب المنفرد.',
        shortDescription: '1 Medium Pizza + 2 Handcrafted Donuts. Perfect balance of savory and sweet.',
        category: catMap['combos']._id,
        categorySlug: 'combos',
        images: [sampleImages.combos[0], sampleImages.pizza[0], sampleImages.donuts[0]],
        price: 24.99,
        discountPrice: 19.99,
        rating: 5.0,
        reviewCount: 140,
        stock: 40,
        availableSizes: [
          { name: 'Standard Duo (1 Medium + 2 Donuts)', priceAdjustment: 0, isDefault: true },
          { name: 'Upsize to Large Pizza', priceAdjustment: 4.50, isDefault: false },
        ],
        ingredients: ['1 Medium Pizza', '2 Handcrafted Donuts', 'Choice of toppings'],
        nutritionalInfo: { calories: 1450, protein: '46g', carbs: '170g', fat: '62g' },
        preparationTime: '20-25 min',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Most Loved Combo',
        tags: ['combos', 'duo', 'bestseller', 'discount', 'sweet-and-savory'],
      },
      {
        name: 'The Crave Trio Feast',
        nameAr: 'وليمة كريف تريو فيست',
        slug: 'the-crave-trio-feast',
        description: 'Why settle for sweet OR savory? Choose BOTH. Includes 1 Large Pizza + 2 Gourmet Donuts + 2 Craft Cold Drinks. Engineered for unforgettable movie nights and couple dates.',
        descriptionAr: 'لماذا تختار بين الحلو والمالح؟ اختر الاثنين معاً! 1 بيتزا كبيرة + 2 دوناتس فاخرة + 2 مشروب بارد منعش، مثالية للسهرات والمناسبات.',
        shortDescription: '1 Large Pizza + 2 Donuts + 2 Craft Drinks. Complete crave satisfaction.',
        category: catMap['combos']._id,
        categorySlug: 'combos',
        images: [sampleImages.combos[1], sampleImages.pizza[1]],
        price: 34.50,
        discountPrice: 28.99,
        rating: 4.9,
        reviewCount: 78,
        stock: 35,
        availableSizes: [
          { name: 'Couple Box (1 Large + 2 Donuts + 2 Drinks)', priceAdjustment: 0, isDefault: true },
          { name: 'Upgrade to 4 Donuts', priceAdjustment: 6.00, isDefault: false },
        ],
        ingredients: ['1 Large Gourmet Pizza', '2 Glazed Donuts', '2 Cold Drinks'],
        nutritionalInfo: { calories: 2100, protein: '58g', carbs: '230g', fat: '82g' },
        preparationTime: '25-30 min',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Save 25%',
        tags: ['combos', 'trio', 'dinner', 'value'],
      },
      {
        name: 'Family & Friends Mega Box',
        nameAr: 'ميجا بوكس العائلة والأصدقاء',
        slug: 'family-and-friends-mega-box',
        description: 'The ultimate party centerpiece: 2 Large Specialty Pizzas, a Party Box of 6 Assorted Donuts, and 4 Chilled Artisan Drinks. Feeds 4 to 6 hungry souls.',
        descriptionAr: 'الصندوق العائلي الأكبر للحفلات: 2 بيتزا كبيرة مخصصة، بوكس حفلات من 6 قطع دوناتس مشكلة، و4 مشروبات مثلجة تكفي من 4 إلى 6 أفراد.',
        shortDescription: '2 Large Pizzas + Box of 6 Donuts + 4 Craft Drinks. Feeds 4-6 people.',
        category: catMap['combos']._id,
        categorySlug: 'combos',
        images: [sampleImages.combos[2], sampleImages.donuts[1]],
        price: 64.99,
        discountPrice: 52.99,
        rating: 5.0,
        reviewCount: 95,
        stock: 25,
        availableSizes: [
          { name: 'Mega Party Pack', priceAdjustment: 0, isDefault: true },
        ],
        ingredients: ['2 Large Pizzas', '6 Assorted Donuts', '4 Cold Drinks'],
        nutritionalInfo: { calories: 4200, protein: '110g', carbs: '440g', fat: '160g' },
        preparationTime: '30-35 min',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Mega Saver',
        tags: ['combos', 'family', 'party', 'mega'],
      },

      // DRINKS
      {
        name: 'Artisan Blood Orange Soda',
        slug: 'artisan-blood-orange-soda',
        description: 'Cold-pressed Sicilian blood oranges gently carbonated with spring water, infused with bruised Moroccan spearmint and raw agave nectar.',
        shortDescription: 'Pressed Sicilian blood oranges, fresh garden mint & light sparkling fizz.',
        category: catMap['drinks']._id,
        categorySlug: 'drinks',
        images: [sampleImages.drinks[0], sampleImages.drinks[1]],
        price: 3.99,
        discountPrice: null,
        rating: 4.8,
        reviewCount: 45,
        stock: 90,
        availableSizes: [
          { name: 'Regular (350ml)', priceAdjustment: 0, isDefault: true },
          { name: 'Large (500ml)', priceAdjustment: 1.25, isDefault: false },
        ],
        ingredients: ['Blood orange juice', 'Sparkling spring water', 'Mint leaves', 'Agave nectar'],
        nutritionalInfo: { calories: 110, protein: '1g', carbs: '26g', fat: '0g' },
        preparationTime: 'Instant Ready',
        isFeatured: false,
        isPopular: true,
        badgeText: 'Refreshing',
        tags: ['drinks', 'soda', 'orange', 'cold', 'vegan'],
      },
      {
        name: 'Cold Brew Salted Foam Coffee',
        slug: 'cold-brew-salted-foam-coffee',
        description: '20-hour cold-steeped single-origin Ethiopian Yirgacheffe coffee, topped with an airy cold sweet cream foam infused with pink Himalayan salt.',
        shortDescription: '20-hour Ethiopian cold brew topped with salted vanilla sweet cream foam.',
        category: catMap['drinks']._id,
        categorySlug: 'drinks',
        images: [sampleImages.drinks[1], sampleImages.drinks[0]],
        price: 4.75,
        discountPrice: 4.25,
        rating: 4.9,
        reviewCount: 63,
        stock: 70,
        availableSizes: [
          { name: 'Regular (400ml)', priceAdjustment: 0, isDefault: true },
          { name: 'Large (600ml)', priceAdjustment: 1.50, isDefault: false },
        ],
        ingredients: ['Cold brew coffee', 'Heavy sweet cream', 'Vanilla extract', 'Himalayan salt'],
        nutritionalInfo: { calories: 160, protein: '2g', carbs: '14g', fat: '11g' },
        preparationTime: 'Instant Ready',
        isFeatured: true,
        isPopular: true,
        badgeText: 'Barista Pick',
        tags: ['drinks', 'coffee', 'coldbrew', 'caffeine'],
      },
      {
        name: 'Sparkling Berry Hibiscus Spritz',
        slug: 'sparkling-berry-hibiscus-spritz',
        description: 'Ruby-red steeped Egyptian hibiscus flowers blended with crushed wild blackberries, tart lime squeeze, and sparkling mineral water.',
        shortDescription: 'Steeped Egyptian hibiscus flowers, crushed blackberries & sparkling lime.',
        category: catMap['drinks']._id,
        categorySlug: 'drinks',
        images: [sampleImages.drinks[2], sampleImages.drinks[0]],
        price: 3.99,
        discountPrice: null,
        rating: 4.7,
        reviewCount: 31,
        stock: 85,
        availableSizes: [
          { name: 'Regular (350ml)', priceAdjustment: 0, isDefault: true },
          { name: 'Large (500ml)', priceAdjustment: 1.25, isDefault: false },
        ],
        ingredients: ['Egyptian hibiscus', 'Crushed blackberries', 'Lime juice', 'Sparkling water'],
        nutritionalInfo: { calories: 95, protein: '1g', carbs: '22g', fat: '0g' },
        preparationTime: 'Instant Ready',
        isFeatured: false,
        isPopular: false,
        badgeText: 'Caffeine Free',
        tags: ['drinks', 'hibiscus', 'berry', 'mocktail'],
      }
    ];

    const insertedProducts = await Product.create(productsData);
    console.log(`[Seed] Created ${insertedProducts.length} Realistic Products`);

    // 4. Seed Coupons
    const coupons = await Coupon.create([
      {
        code: 'WELCOME10',
        description: '10% discount on your first Sweet & Savory order',
        type: 'percentage',
        value: 10,
        minOrder: 15,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'SWEET20',
        description: '20% discount on orders over $40',
        type: 'percentage',
        value: 20,
        minOrder: 40,
        maxDiscount: 15,
        expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        isActive: true,
      },
      {
        code: 'SAVORY5',
        description: '$5 OFF any craving order over $25',
        type: 'fixed',
        value: 5,
        minOrder: 25,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        isActive: true,
      },
      {
        code: 'COMBOMAGIC',
        description: '15% OFF all Combo Box orders',
        type: 'percentage',
        value: 15,
        minOrder: 20,
        expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        isActive: true,
      }
    ]);
    console.log(`[Seed] Created ${coupons.length} Active Coupons`);

    // 5. Seed Customer Reviews
    const sampleReviews = [
      {
        user: demoUser._id,
        userName: demoUser.name,
        userAvatar: demoUser.avatar,
        product: insertedProducts[0]._id, // Margherita
        rating: 5,
        comment: 'Hands down the best crust in the city! The hot honey combo with their dough is sheer culinary magic. Ordering again tonight.',
        isVerifiedPurchase: true,
      },
      {
        user: demoUser._id,
        userName: 'Karim Mansour',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        product: insertedProducts[1]._id, // Pepperoni
        rating: 5,
        comment: 'The cup and char pepperoni is unreal. You can actually taste the quality of the beef and that habanero honey gave it the ultimate kick.',
        isVerifiedPurchase: true,
      },
      {
        user: demoUser._id,
        userName: 'Layla El-Sayed',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        product: insertedProducts[5]._id, // Dark Cocoa Donut
        rating: 5,
        comment: 'The Valrhona ganache is restaurant-quality fine dining inside a donut. Not overly sugary, perfectly balanced bitter-sweet chocolate.',
        isVerifiedPurchase: true,
      },
      {
        user: demoUser._id,
        userName: 'Omar Sherif',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        product: insertedProducts[10]._id, // Sweet & Savory Duo
        rating: 5,
        comment: 'Our Friday family tradition. Getting a smoky pizza followed by hot fresh donuts eliminates all arguments on what to order!',
        isVerifiedPurchase: true,
      }
    ];

    await Review.create(sampleReviews);
    console.log(`[Seed] Created ${sampleReviews.length} Verified Reviews`);

    // 6. Seed Sample Orders for Demo User and Admin Stats
    const sampleOrders = [
      {
        orderNumber: 'SWT-78219-491',
        user: demoUser._id,
        items: [
          {
            product: insertedProducts[0]._id,
            name: insertedProducts[0].name,
            image: insertedProducts[0].images[0],
            quantity: 1,
            selectedSize: { name: 'Medium (12")', priceAdjustment: 5.50 },
            selectedToppings: [{ name: 'Hot Honey Drizzle', price: 1.50 }],
            selectedFlavors: [],
            unitPrice: 18.99,
            itemTotal: 18.99,
            specialInstructions: 'Well done crust please',
          },
          {
            product: insertedProducts[5]._id,
            name: insertedProducts[5].name,
            image: insertedProducts[5].images[0],
            quantity: 2,
            selectedSize: { name: 'Single Donut', priceAdjustment: 0 },
            selectedToppings: [],
            selectedFlavors: [{ name: 'Gold Leaf Flakes', price: 2.00 }],
            unitPrice: 5.75,
            itemTotal: 11.50,
          }
        ],
        shippingAddress: {
          fullName: 'Sarah Mitchell',
          phone: '+20 111 987 6543',
          street: '72 Nile View Promenade, Apt 4B',
          city: 'Zamalek, Cairo',
          state: 'Cairo Governorate',
          postalCode: '11211',
          deliveryNotes: 'Buzz 4B or leave with door attendant',
        },
        paymentInfo: {
          method: 'simulated_card',
          status: 'completed',
          transactionId: 'TXN-998201',
          cardLast4: '4242',
        },
        orderStatus: 'preparing',
        statusHistory: [
          { status: 'pending', note: 'Order placed online', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
          { status: 'preparing', note: 'Dough is in the wood-fired oven', timestamp: new Date(Date.now() - 10 * 60 * 1000) }
        ],
        subtotal: 30.49,
        discount: 3.05,
        deliveryFee: 3.50,
        total: 30.94,
        appliedCoupon: { code: 'WELCOME10', discountValue: 3.05 },
        estimatedDeliveryTime: '20-30 minutes'
      },
      {
        orderNumber: 'SWT-64103-882',
        user: demoUser._id,
        items: [
          {
            product: insertedProducts[10]._id, // Sweet & Savory Duo
            name: insertedProducts[10].name,
            image: insertedProducts[10].images[0],
            quantity: 1,
            selectedSize: { name: 'Standard Duo (1 Medium + 2 Donuts)', priceAdjustment: 0 },
            selectedToppings: [],
            selectedFlavors: [],
            unitPrice: 19.99,
            itemTotal: 19.99,
          },
          {
            product: insertedProducts[14]._id, // Cold Brew
            name: insertedProducts[14].name,
            image: insertedProducts[14].images[0],
            quantity: 1,
            selectedSize: { name: 'Regular (400ml)', priceAdjustment: 0 },
            selectedToppings: [],
            selectedFlavors: [],
            unitPrice: 4.25,
            itemTotal: 4.25,
          }
        ],
        shippingAddress: {
          fullName: 'Sarah Mitchell',
          phone: '+20 111 987 6543',
          street: '72 Nile View Promenade, Apt 4B',
          city: 'Zamalek, Cairo',
          state: 'Cairo Governorate',
          postalCode: '11211',
          deliveryNotes: '',
        },
        paymentInfo: {
          method: 'simulated_card',
          status: 'completed',
          transactionId: 'TXN-941103',
          cardLast4: '4242',
        },
        orderStatus: 'delivered',
        statusHistory: [
          { status: 'pending', note: 'Order placed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'preparing', note: 'Baking and packing', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) },
          { status: 'out_for_delivery', note: 'Driver Ahmed is en route', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000) },
          { status: 'delivered', note: 'Handed to customer', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000) },
        ],
        subtotal: 24.24,
        discount: 0,
        deliveryFee: 3.50,
        total: 27.74,
        estimatedDeliveryTime: 'Delivered',
      }
    ];

    await Order.create(sampleOrders);
    console.log(`[Seed] Created ${sampleOrders.length} Realistic Sample Orders`);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY');
    console.log('Admin Account: admin@sweetandsavory.com | AdminPassword123!');
    console.log('User Account:  sarah@example.com       | UserPassword123!');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
