// Catálogo de muestra — Fase 03 (catálogo real desde la API) todavía no está
// construida, así que por ahora la tienda navega sobre estos datos locales.
// La forma de cada producto ya está pensada para calzar con lo que devolverá
// GET /products y GET /products/:id más adelante, para que el cambio sea
// mínimo cuando ese endpoint exista.

export const CATEGORIES = [
  { slug: 'tecnologia', name: 'Tecnología', emoji: '💻' },
  { slug: 'hogar', name: 'Hogar y Cocina', emoji: '🏠' },
  { slug: 'moda', name: 'Moda', emoji: '👕' },
  { slug: 'deportes', name: 'Deportes y Aire Libre', emoji: '🏋️' },
  { slug: 'belleza', name: 'Belleza y Cuidado Personal', emoji: '💄' },
  { slug: 'juguetes', name: 'Juguetes y Bebés', emoji: '🧸' },
  { slug: 'herramientas', name: 'Herramientas', emoji: '🛠️' },
];

const RAW_PRODUCTS = [
  // Tecnología
  { cat: 'tecnologia', title: 'Audífonos inalámbricos con cancelación de ruido', price: 249900, oldPrice: 329900, rating: 4.6, reviews: 1284, stock: 42, seed: 'tech-1', brand: 'SoundCore', bullets: ['Cancelación de ruido activa (ANC)', 'Hasta 30 horas de batería', 'Bluetooth 5.3 multipunto', 'Resistencia al agua IPX4'] },
  { cat: 'tecnologia', title: 'Smartwatch con monitor de ritmo cardíaco y GPS', price: 389900, oldPrice: 459900, rating: 4.4, reviews: 897, stock: 27, seed: 'tech-2', brand: 'Pulse', bullets: ['Pantalla AMOLED 1.4"', 'GPS integrado', 'Resistente al agua 5ATM', 'Batería de 7 días'] },
  { cat: 'tecnologia', title: 'Cargador rápido USB-C 65W GaN', price: 89900, rating: 4.7, reviews: 2033, stock: 120, seed: 'tech-3', brand: 'VoltPro', bullets: ['Carga 3 dispositivos a la vez', 'Tecnología GaN compacta', 'Compatible con laptops y celulares'] },
  { cat: 'tecnologia', title: 'Mouse inalámbrico ergonómico silencioso', price: 64900, oldPrice: 79900, rating: 4.5, reviews: 654, stock: 88, seed: 'tech-4', brand: 'ClickEase', bullets: ['Clic silencioso', 'Sensor óptico 1600 DPI', 'Batería recargable USB-C'] },
  { cat: 'tecnologia', title: 'Disco duro externo SSD 1TB USB 3.2', price: 299900, rating: 4.8, reviews: 1502, stock: 35, seed: 'tech-5', brand: 'DataFast', bullets: ['Velocidad de hasta 1050 MB/s', 'Carcasa resistente a caídas', 'Compatible con PC, Mac y consolas'] },
  { cat: 'tecnologia', title: 'Teclado mecánico retroiluminado RGB', price: 219900, oldPrice: 259900, rating: 4.5, reviews: 743, stock: 51, seed: 'tech-6', brand: 'KeyForce', bullets: ['Switches mecánicos rojos', 'Retroiluminación RGB personalizable', 'Reposamuñecas incluido'] },
  { cat: 'tecnologia', title: 'Cámara web Full HD 1080p con micrófono', price: 129900, rating: 4.3, reviews: 412, stock: 63, seed: 'tech-7', brand: 'ViewClear', bullets: ['1080p a 30fps', 'Micrófono con reducción de ruido', 'Clip universal para monitores'] },
  { cat: 'tecnologia', title: 'Parlante Bluetooth portátil resistente al agua', price: 159900, oldPrice: 189900, rating: 4.6, reviews: 968, stock: 74, seed: 'tech-8', brand: 'BoomBox', bullets: ['12 horas de reproducción', 'Resistencia IPX7', 'Sonido estéreo 360°'] },

  // Hogar
  { cat: 'hogar', title: 'Set de ollas antiadherentes de 8 piezas', price: 349900, oldPrice: 419900, rating: 4.7, reviews: 1120, stock: 30, seed: 'hogar-1', brand: 'CocinaPro', bullets: ['Antiadherente libre de PFOA', 'Aptas para todo tipo de estufa', 'Mangos ergonómicos ergonómicos'] },
  { cat: 'hogar', title: 'Aspiradora robot con mapeo inteligente', price: 899900, oldPrice: 1099900, rating: 4.4, reviews: 531, stock: 18, seed: 'hogar-2', brand: 'CleanBot', bullets: ['Mapeo láser LIDAR', 'Control por app', 'Succión de 3000Pa'] },
  { cat: 'hogar', title: 'Juego de sábanas 200 hilos algodón queen', price: 149900, rating: 4.6, reviews: 802, stock: 55, seed: 'hogar-3', brand: 'DreamHome', bullets: ['100% algodón peinado', 'Incluye funda de almohada', 'Hipoalergénico'] },
  { cat: 'hogar', title: 'Cafetera automática con molino integrado', price: 459900, oldPrice: 549900, rating: 4.5, reviews: 389, stock: 22, seed: 'hogar-4', brand: 'BrewMaster', bullets: ['Molino de granos integrado', 'Programable 24h', 'Jarra térmica de 1.2L'] },
  { cat: 'hogar', title: 'Organizador modular de closet 6 cubos', price: 119900, rating: 4.3, reviews: 276, stock: 66, seed: 'hogar-5', brand: 'OrdenaYa', bullets: ['Ensamble sin herramientas', 'Estructura reforzada', 'Fácil de mover'] },
  { cat: 'hogar', title: 'Purificador de aire con filtro HEPA', price: 379900, oldPrice: 429900, rating: 4.6, reviews: 445, stock: 29, seed: 'hogar-6', brand: 'AirePuro', bullets: ['Filtro HEPA H13', 'Cubre hasta 40m²', 'Modo nocturno silencioso'] },
  { cat: 'hogar', title: 'Licuadora de alta potencia 1200W', price: 199900, rating: 4.5, reviews: 690, stock: 47, seed: 'hogar-7', brand: 'BlendMax', bullets: ['Vaso de vidrio 2L', 'Cuchillas de acero quirúrgico', '6 velocidades + pulso'] },
  { cat: 'hogar', title: 'Lámpara de escritorio LED con carga inalámbrica', price: 99900, oldPrice: 129900, rating: 4.4, reviews: 312, stock: 58, seed: 'hogar-8', brand: 'LumiDesk', bullets: ['3 tonos de luz', 'Base con carga Qi', 'Brazo flexible'] },

  // Moda
  { cat: 'moda', title: 'Chaqueta impermeable con capucha unisex', price: 179900, oldPrice: 229900, rating: 4.5, reviews: 587, stock: 40, seed: 'moda-1', brand: 'UrbanWear', bullets: ['Tela impermeable transpirable', 'Bolsillos con cierre', 'Corte unisex'] },
  { cat: 'moda', title: 'Zapatillas deportivas running ultraligeras', price: 259900, rating: 4.7, reviews: 1340, stock: 62, seed: 'moda-2', brand: 'RunFast', bullets: ['Suela de espuma reactiva', 'Malla transpirable', 'Amortiguación en talón'] },
  { cat: 'moda', title: 'Jean clásico corte recto para hombre', price: 129900, oldPrice: 159900, rating: 4.3, reviews: 421, stock: 90, seed: 'moda-3', brand: 'DenimCo', bullets: ['Algodón con elastano', 'Corte recto clásico', 'Disponible varias tallas'] },
  { cat: 'moda', title: 'Vestido casual de lino manga corta', price: 139900, rating: 4.6, reviews: 298, stock: 48, seed: 'moda-4', brand: 'LinoStyle', bullets: ['Tela fresca de lino', 'Ideal para clima cálido', 'Fácil de combinar'] },
  { cat: 'moda', title: 'Gafas de sol polarizadas unisex', price: 89900, oldPrice: 119900, rating: 4.5, reviews: 763, stock: 100, seed: 'moda-5', brand: 'SunView', bullets: ['Protección UV400', 'Lentes polarizados', 'Armazón ligero'] },
  { cat: 'moda', title: 'Mochila urbana antirrobo con puerto USB', price: 149900, rating: 4.6, reviews: 934, stock: 55, seed: 'moda-6', brand: 'CityPack', bullets: ['Compartimento para laptop 15"', 'Cierre antirrobo oculto', 'Puerto de carga USB externo'] },
  { cat: 'moda', title: 'Reloj análogo de acero inoxidable', price: 219900, oldPrice: 269900, rating: 4.4, reviews: 356, stock: 33, seed: 'moda-7', brand: 'TimeCraft', bullets: ['Correa de acero inoxidable', 'Resistente al agua 3ATM', 'Movimiento de cuarzo japonés'] },
  { cat: 'moda', title: 'Sudadera con capucha unisex algodón perchado', price: 109900, rating: 4.5, reviews: 512, stock: 78, seed: 'moda-8', brand: 'ComfyFit', bullets: ['Algodón perchado suave', 'Bolsillo canguro', 'Corte unisex oversize'] },

  // Deportes
  { cat: 'deportes', title: 'Bicicleta todo terreno rodado 29"', price: 1299900, oldPrice: 1499900, rating: 4.6, reviews: 214, stock: 12, seed: 'deportes-1', brand: 'TrailRide', bullets: ['21 velocidades Shimano', 'Marco de aluminio ligero', 'Frenos de disco mecánicos'] },
  { cat: 'deportes', title: 'Set de mancuernas ajustables 20kg', price: 289900, rating: 4.7, reviews: 456, stock: 25, seed: 'deportes-2', brand: 'IronFit', bullets: ['Ajuste rápido de peso', 'Recubrimiento antideslizante', 'Ideal para casa'] },
  { cat: 'deportes', title: 'Carpa impermeable para camping 4 personas', price: 349900, oldPrice: 399900, rating: 4.5, reviews: 189, stock: 20, seed: 'deportes-3', brand: 'OutXplore', bullets: ['Montaje en 5 minutos', 'Doble capa impermeable', 'Incluye bolsa de transporte'] },
  { cat: 'deportes', title: 'Balón de fútbol profesional talla 5', price: 79900, rating: 4.6, reviews: 601, stock: 85, seed: 'deportes-4', brand: 'GoalPro', bullets: ['Cámara de butilo', 'Costura termosellada', 'Aprobado para competencia'] },
  { cat: 'deportes', title: 'Colchoneta de yoga antideslizante 6mm', price: 69900, oldPrice: 89900, rating: 4.7, reviews: 823, stock: 110, seed: 'deportes-5', brand: 'ZenMat', bullets: ['Espuma NBR de alta densidad', 'Superficie antideslizante', 'Incluye correa de transporte'] },
  { cat: 'deportes', title: 'Guantes de entrenamiento con soporte de muñeca', price: 54900, rating: 4.4, reviews: 267, stock: 95, seed: 'deportes-6', brand: 'GripMax', bullets: ['Acolchado de gel', 'Soporte de muñeca ajustable', 'Palma antideslizante'] },
  { cat: 'deportes', title: 'Patines en línea ajustables para adulto', price: 219900, oldPrice: 259900, rating: 4.3, reviews: 178, stock: 30, seed: 'deportes-7', brand: 'RollX', bullets: ['Ruedas ABEC-7', 'Freno trasero de seguridad', 'Ajuste de talla dial'] },
  { cat: 'deportes', title: 'Cuerda para saltar con contador digital', price: 39900, rating: 4.5, reviews: 512, stock: 140, seed: 'deportes-8', brand: 'JumpTech', bullets: ['Contador de saltos y calorías', 'Cable ajustable', 'Mangos ergonómicos'] },

  // Belleza
  { cat: 'belleza', title: 'Set de brochas de maquillaje profesional 12 piezas', price: 89900, oldPrice: 119900, rating: 4.6, reviews: 745, stock: 70, seed: 'belleza-1', brand: 'GlowPro', bullets: ['Cerdas suaves sintéticas', 'Mango de madera', 'Incluye estuche'] },
  { cat: 'belleza', title: 'Secador de pelo iónico profesional 2200W', price: 179900, rating: 4.5, reviews: 612, stock: 40, seed: 'belleza-2', brand: 'AirStyle', bullets: ['Tecnología iónica anti-frizz', '3 niveles de temperatura', 'Motor AC de larga duración'] },
  { cat: 'belleza', title: 'Plancha de cabello cerámica con placas flotantes', price: 149900, oldPrice: 179900, rating: 4.4, reviews: 398, stock: 52, seed: 'belleza-3', brand: 'SleekPro', bullets: ['Placas cerámicas flotantes', 'Calentamiento rápido', 'Control digital de temperatura'] },
  { cat: 'belleza', title: 'Set de skincare rutina coreana 5 pasos', price: 129900, rating: 4.7, reviews: 934, stock: 60, seed: 'belleza-4', brand: 'SeoulSkin', bullets: ['Limpiador + tónico + sérum + crema + protector', 'Libre de parabenos', 'Apto piel sensible'] },
  { cat: 'belleza', title: 'Perfume de larga duración unisex 100ml', price: 199900, oldPrice: 249900, rating: 4.5, reviews: 421, stock: 38, seed: 'belleza-5', brand: 'EssenceLux', bullets: ['Notas amaderadas y cítricas', 'Duración hasta 8 horas', 'Presentación en caja de regalo'] },
  { cat: 'belleza', title: 'Depiladora de luz pulsada IPL', price: 449900, rating: 4.3, reviews: 267, stock: 22, seed: 'belleza-6', brand: 'SmoothLight', bullets: ['500,000 destellos', 'Uso en cuerpo y rostro', 'Resultados desde la semana 4'] },
  { cat: 'belleza', title: 'Kit de manicura y pedicura eléctrico', price: 99900, oldPrice: 129900, rating: 4.4, reviews: 356, stock: 65, seed: 'belleza-7', brand: 'NailCare', bullets: ['11 accesorios intercambiables', 'Motor de doble velocidad', 'Recargable USB'] },
  { cat: 'belleza', title: 'Espejo cosmético con luz LED regulable', price: 79900, rating: 4.6, reviews: 289, stock: 74, seed: 'belleza-8', brand: 'MirrorLight', bullets: ['Aumento 10x', 'Luz LED regulable', 'Base giratoria 360°'] },

  // Juguetes y bebés
  { cat: 'juguetes', title: 'Set de bloques de construcción 500 piezas', price: 99900, oldPrice: 129900, rating: 4.7, reviews: 812, stock: 68, seed: 'juguetes-1', brand: 'BuildKids', bullets: ['Compatible con marcas líderes', 'Piezas libres de BPA', 'Incluye guía de figuras'] },
  { cat: 'juguetes', title: 'Coche a control remoto todo terreno', price: 159900, rating: 4.5, reviews: 456, stock: 44, seed: 'juguetes-2', brand: 'SpeedToy', bullets: ['Velocidad hasta 20km/h', 'Batería recargable', 'Suspensión todo terreno'] },
  { cat: 'juguetes', title: 'Coche para bebé (travel system) 3 en 1', price: 899900, oldPrice: 1099900, rating: 4.6, reviews: 234, stock: 15, seed: 'juguetes-3', brand: 'BabyRide', bullets: ['Incluye silla para auto', 'Manija reversible', 'Sistema de plegado rápido'] },
  { cat: 'juguetes', title: 'Peluche interactivo con sonidos', price: 69900, rating: 4.5, reviews: 378, stock: 90, seed: 'juguetes-4', brand: 'HuggyFriends', bullets: ['Sonidos y luces interactivas', 'Material hipoalergénico', 'Apto desde los 6 meses'] },
  { cat: 'juguetes', title: 'Monitor de bebé con cámara y visión nocturna', price: 249900, oldPrice: 299900, rating: 4.4, reviews: 289, stock: 32, seed: 'juguetes-5', brand: 'SafeCrib', bullets: ['Visión nocturna infrarroja', 'Audio bidireccional', 'Alcance de 300m'] },
  { cat: 'juguetes', title: 'Rompecabezas 1000 piezas paisaje', price: 44900, rating: 4.6, reviews: 198, stock: 120, seed: 'juguetes-6', brand: 'PuzzleTime', bullets: ['Piezas de corte preciso', 'Póster de referencia incluido', 'Ideal para toda la familia'] },
  { cat: 'juguetes', title: 'Triciclo evolutivo para niños 1-5 años', price: 219900, oldPrice: 259900, rating: 4.5, reviews: 167, stock: 28, seed: 'juguetes-7', brand: 'KidRide', bullets: ['Manija de control parental', 'Asiento reclinable', 'Toldo removible'] },
  { cat: 'juguetes', title: 'Set de té de cocina de juguete para niños', price: 54900, rating: 4.7, reviews: 143, stock: 76, seed: 'juguetes-8', brand: 'PlayHouse', bullets: ['24 piezas de juego', 'Material plástico resistente', 'Fomenta el juego simbólico'] },

  // Herramientas
  { cat: 'herramientas', title: 'Taladro percutor inalámbrico 20V con maletín', price: 329900, oldPrice: 389900, rating: 4.7, reviews: 645, stock: 34, seed: 'herr-1', brand: 'PowerDrill', bullets: ['Batería de litio 20V', 'Incluye 30 accesorios', 'Función percutor'] },
  { cat: 'herramientas', title: 'Set de herramientas manuales 128 piezas', price: 249900, rating: 4.6, reviews: 512, stock: 40, seed: 'herr-2', brand: 'ToolMaster', bullets: ['Estuche organizador rígido', 'Acero al cromo vanadio', 'Ideal para el hogar'] },
  { cat: 'herramientas', title: 'Sierra circular eléctrica 1500W', price: 279900, oldPrice: 329900, rating: 4.5, reviews: 289, stock: 22, seed: 'herr-3', brand: 'CutPro', bullets: ['Disco de 7 1/4"', 'Guía láser de corte', 'Ajuste de profundidad y ángulo'] },
  { cat: 'herramientas', title: 'Escalera de aluminio plegable 6 escalones', price: 189900, rating: 4.4, reviews: 156, stock: 30, seed: 'herr-4', brand: 'StepSafe', bullets: ['Aluminio reforzado', 'Plegado compacto', 'Capacidad 150kg'] },
  { cat: 'herramientas', title: 'Multímetro digital profesional', price: 79900, oldPrice: 99900, rating: 4.6, reviews: 334, stock: 58, seed: 'herr-5', brand: 'MeasurePro', bullets: ['Mide voltaje, corriente y resistencia', 'Pantalla retroiluminada', 'Incluye puntas de prueba'] },
  { cat: 'herramientas', title: 'Compresor de aire portátil 24L', price: 459900, rating: 4.5, reviews: 198, stock: 16, seed: 'herr-6', brand: 'AirForce', bullets: ['Motor libre de aceite', 'Tanque de 24 litros', 'Incluye kit de accesorios'] },
  { cat: 'herramientas', title: 'Pistola de calor 2000W con accesorios', price: 99900, oldPrice: 119900, rating: 4.3, reviews: 145, stock: 48, seed: 'herr-7', brand: 'HeatFix', bullets: ['2 niveles de temperatura', 'Incluye boquillas intercambiables', 'Mango ergonómico'] },
  { cat: 'herramientas', title: 'Nivel láser autonivelante de líneas cruzadas', price: 219900, rating: 4.6, reviews: 176, stock: 25, seed: 'herr-8', brand: 'LaserLine', bullets: ['Autonivelante ±4°', 'Alcance de 20 metros', 'Incluye trípode'] },
];

export const PRODUCTS = RAW_PRODUCTS.map((p, i) => ({
  id: `p${i + 1}`,
  title: p.title,
  brand: p.brand,
  category: p.cat,
  price: p.price,
  oldPrice: p.oldPrice || null,
  rating: p.rating,
  reviews: p.reviews,
  stock: p.stock,
  freeShipping: p.price >= 100000,
  image: `https://picsum.photos/seed/${p.seed}/600/600`,
  gallery: [0, 1, 2].map((n) => `https://picsum.photos/seed/${p.seed}-${n}/600/600`),
  description:
    `${p.title} de la marca ${p.brand}. Producto de referencia mientras conectamos el catálogo real — ` +
    `disponible para simular todo el flujo de compra de la tienda.`,
  bullets: p.bullets,
}));

export function getProductsByCategory(slug) {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
