// Configuración de productos y categorías
const productosPorCategoria = {
  "Lácteos": ["Yogurt", "Pulpa de avena", "Queso"],
  "Panadería": ["Envueltos", "Almojábanas", "Arepas"],
  "Otros": ["Rellenas", "Panela", "Huevos", "Almuerzo"]
};

const yogurtSabores = ["Durazno", "Fresa", "Mora", "Guanábana", "Feijoa"];
const tiposQueso = ["Campesino", "Doble Crema", "Pera"];
const tiposArepas = ["Boyacense", "de Chocolo"];

// Precios base
const PRECIOS = {
  yogurt: {
    "1L": 10000,
    "2L": 18000
  },
  queso: 13000,
  almohabanas: 2500,
  envueltos: {
    "Normal": 2000,
    "Especial": 3500
  },
  arepas: {
    "Boyacense": 3000,
    "de Chocolo": 5000
  },
  rellenas: 2500,
  panela: 30000,
  almuerzo: 15000,
  pulpaAvena: 5000,
  huevos: 15000
};

// Información de productos para la página de inicio
const PRODUCTOS_INFO = [
  {
    nombre: "Yogurt",
    descripcion: "Natural y de sabores, casero, cremoso y delicioso.",
    imagen: "https://st2.depositphotos.com/3833507/7122/i/450/depositphotos_71220963-stock-photo-tasty-strawberry-yogurt.jpg"
  },
  {
    nombre: "Arepas Boyacenses",
    descripcion: "Hechas a mano con maíz 100% natural.",
    imagen: "https://www.elespectador.com/resizer/v2/MMSF4T4WD5HFLIZBHYYDXIBWZQ.jpg?auth=364bf9108ea2fcbc7b9562a38d8ca6e803b48a0943b1ce5cb5ce398bcaba3d9b&width=1110&height=739&smart=true&quality=60"
  },
  {
    nombre: "Arepas de chocolo",
    descripcion: "Hechas a mano con maíz 100% natural y con delicioso queso.",
    imagen: "https://i.ytimg.com/vi/JLzbNGR8Sh4/sddefault.jpg"
  },
  {
    nombre: "Envueltos",
    descripcion: "Tradicionales, suaves y llenos de sabor.",
    imagen: "https://www.semana.com/resizer/v2/47UQRRUPLBDZLGU73EX3HAWWGU.jpg?auth=f37d6a8c97bb914dccede5c919a7ee48406dfe3a2685a99d2b00a62c16a91531&smart=true&quality=75&width=1280&fitfill=false"
  },
  {
    nombre: "Queso campesino",
    descripcion: "Fresco, artesanal, ideal para acompañar.",
    imagen: "https://riqa.pe/wp-content/uploads/2025/01/queso-fresco-sin-sal.jpg"
  },
  {
    nombre: "Queso doble crema",
    descripcion: "Fresco, artesanal, ideal para acompañar.",
    imagen: "https://www.lekue.com/cdn-cgi/image/format=auto,onerror=redirect/media/wysiwyg/LEKUE/lekueblogs/queso-doble-crema.jpg"
  },
  {
    nombre: "Queso pera",
    descripcion: "Fresco, artesanal, ideal para acompañar.",
    imagen: "https://pbs.twimg.com/media/CwA0KhgWcAEr2fQ.jpg"
  },
  {
    nombre: "Almojábanas",
    descripcion: "Esponjosas y dulces, hechas con cuajada.",
    imagen: "https://indumezmao.com.co/wp-content/uploads/2024/09/almojabanas-mao.png"
  },
  {
    nombre: "Panela",
    descripcion: "Natural y dulce, perfecta para bebidas o postres.",
    imagen: "https://www.tropicanafm.com/wp-content/uploads/2024/02/Panela_gettyimages.jpg"
  },
  {
    nombre: "Pulpa de Avena",
    descripcion: "Refrescante, saludable y casera.",
    imagen: "https://i.ytimg.com/vi/Lankfb_12O8/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGH8gRigsMA8=&rs=AOn4CLA9yngRG0I1RFcr_Bz2JxamJE8oNQ"
  },
  {
    nombre: "Rellenas",
    descripcion: "Arepitas rellenas de queso, suaves y doraditas.",
    imagen: "https://www.infobae.com/new-resizer/Owbs3cevi58yv_i19oFHy6ewqEA=/arc-anglerfish-arc2-prod-infobae/public/PHHWHA74SFBV3OPDVDTDQANJ7U.jpg"
  },
  {
    nombre: "Almuerzo ",
    descripcion: "Delicioso almuerzo con rellena papa longaniza y yuca.",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRofsuAcfH5EI6UmOkrjJJE5BVsfBUjJnahwxz6ZtG27QQfoKiJZyUbP5c-aHolD4nQLTw&usqp=CAU"
  },
  {
    nombre: "Huevos",
    descripcion: "Deliciosos huevos frescos de la granja a tu hogar.",
    imagen: "https://www.cclataurina.com/wp-content/uploads/2024/05/huevos.webp"
  }
];