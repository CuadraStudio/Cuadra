window.SHOP_CONFIG = {
tenant: {
slug: 'demotienda',
name: 'Vera Store',
tagline: 'Tu look, en un clic. Pedido por WhatsApp.',
phone: '+59899000000',
phoneDisplay: '099 000 000',
email: 'hola@verastore.uy',
address: '21 de Setiembre 3421, Pocitos, Montevideo',
instagramHandle: '@verastore.demouy',
instagramUrl: 'https://instagram.com/verastore.demouy',
currency: 'UYU'
},

// API multi-tenant (hoy inexistente → el sitio usa el catálogo local).
api: {
enabled: false,
apiBase: 'https://cuadra-api-t7rg.onrender.com/api/demotienda',
requestTimeoutMs: 8000
},

whatsapp: {
base: 'https://wa.me/59899000000',
// Mensaje por defecto (sin carrito)
message: 'Hola Vera Store, quiero hacer una consulta.'
},

mapsUrl: 'https://maps.google.com/?q=21+de+Setiembre+3421+Pocitos+Montevideo',

demo: {
enabled: true,
pin: '0000',
storageKey: 'verastore_demo_orders'
},

DEMO_CATALOG: [
// ===================== Accesorios =====================
{
id: 'aros-sol',
name: 'Aros Sol',
category: 'Accesorios',
price: 690,
desc: 'Aros bañados en oro, livianos, con textura mate. El detalle dorado que levanta cualquier look.',
variants: [
{ color: 'Dorado', stock: 'disponible' },
{ color: 'Plateado', stock: 'disponible' }
],
delivery: 'ambos',
img: 'img/accesorios-aros.jpg'
},
{
id: 'collar-luna',
name: 'Collar Luna',
category: 'Accesorios',
price: 890,
desc: 'Dije de media luna en acero quirúrgico con cadena fina. No se oxida, no mancha la piel.',
variants: [
{ color: 'Dorado', stock: 'disponible' },
{ color: 'Plateado', stock: 'agotado' }
],
delivery: 'ambos',
img: 'img/accesorios-collar.jpg'
},
{
id: 'gorra-lino',
name: 'Gorra de Lino',
category: 'Accesorios',
price: 1190,
desc: 'Gorra de lino lavado con visera curva. Suave, fresca y con cierre ajustable.',
variants: [
{ color: 'Arena', stock: 'disponible' },
{ color: 'Terracota', stock: 'disponible' },
{ color: 'Verde salvia', stock: 'agotado' }
],
delivery: 'ambos',
img: 'img/accesorios-gorra.jpg'
},
{
id: 'bufanda-ambar',
name: 'Bufanda Ámbar',
category: 'Accesorios',
price: 990,
desc: 'Tejido suave en tono ámbar, ideal para las mañanas frescas. Trama abrigada y liviana.',
variants: [],
stock: 'agotado',
delivery: 'retiro',
img: 'img/accesorios-bufanda.jpg'
},

// ===================== Indumentaria =====================
{
id: 'camisola-nube',
name: 'Camisola Nube',
category: 'Indumentaria',
price: 1900,
desc: 'Camisola de viscosa con caída fluida y mangas amplias. Cómoda de día y de noche.',
variants: [
{ talle: 'S', color: 'Terracota', stock: 'disponible' },
{ talle: 'M', color: 'Terracota', stock: 'disponible' },
{ talle: 'L', color: 'Crema', stock: 'disponible' },
{ talle: 'M', color: 'Verde salvia', stock: 'agotado' }
],
delivery: 'envio',
img: 'img/indumentaria-camisola.jpg'
},
{
id: 'remera-basica',
name: 'Remera Básica',
category: 'Indumentaria',
price: 1290,
desc: 'Remera de algodón peinado, corte relajado y cuello redondo. La base de todos los días.',
variants: [
{ talle: 'S', color: 'Crema', stock: 'disponible' },
{ talle: 'M', color: 'Crema', stock: 'disponible' },
{ talle: 'L', color: 'Tinta', stock: 'disponible' },
{ talle: 'S', color: 'Tinta', stock: 'agotado' }
],
delivery: 'ambos',
img: 'img/indumentaria-remera.jpg'
},
{
id: 'camisa-lino',
name: 'Camisa de Lino',
category: 'Indumentaria',
price: 2400,
desc: 'Camisa de lino europeo con botones de nácar. Transpirable, elegante y fácil de combinar.',
variants: [
{ talle: 'S', color: 'Arena', stock: 'disponible' },
{ talle: 'M', color: 'Arena', stock: 'disponible' },
{ talle: 'L', color: 'Arena', stock: 'disponible' }
],
delivery: 'ambos',
img: 'img/indumentaria-camisa.jpg'
},
{
id: 'sweater-crudo',
name: 'Sweater Crudo',
category: 'Indumentaria',
price: 2700,
desc: 'Sweater de punto grueso en tono crudo. Abrigado, con hombros caídos y puños anchos.',
variants: [
{ talle: 'M', color: 'Crudo', stock: 'disponible' },
{ talle: 'L', color: 'Crudo', stock: 'disponible' }
],
delivery: 'envio',
img: 'img/indumentaria-sweater.jpg'
},

// ================= Bolsos y Mochilas =================
{
id: 'bolso-tote',
name: 'Bolso Tote Roma',
category: 'Bolsos y Mochilas',
price: 2900,
desc: 'Tote de cuero sintético con interior reforzado y bolsillo con cierre. Entra todo.',
variants: [
{ color: 'Terracota', stock: 'disponible' },
{ color: 'Tinta', stock: 'disponible' }
],
delivery: 'ambos',
img: 'img/bolsos-tote.jpg'
},
{
id: 'mochila-lona',
name: 'Mochila de Lona',
category: 'Bolsos y Mochilas',
price: 2350,
desc: 'Mochila de lona encerada con compartimento para notebook. Cómoda y resistente al agua.',
variants: [
{ color: 'Verde salvia', stock: 'disponible' },
{ color: 'Arena', stock: 'agotado' }
],
delivery: 'envio',
img: 'img/bolsos-mochila.jpg'
},
{
id: 'rinonera-siena',
name: 'Riñonera Siena',
category: 'Bolsos y Mochilas',
price: 1490,
desc: 'Riñonera compacta con dos cierres y correa ajustable. Manos libres para todo el día.',
variants: [],
stock: 'disponible',
delivery: 'ambos',
img: 'img/bolsos-rinonera.jpg'
},

// =================== Cuidado y Hogar ==================
{
id: 'vela-ambar',
name: 'Vela Ámbar',
category: 'Cuidado y Hogar',
price: 850,
desc: 'Vela de soja con aroma a ámbar y vainilla. 40 horas de encendido en vaso reutilizable.',
variants: [],
stock: 'disponible',
delivery: 'ambos',
img: 'img/hogar-vela.jpg'
},
{
id: 'jabon-avena',
name: 'Jabón de Avena',
category: 'Cuidado y Hogar',
price: 350,
desc: 'Jabón artesanal de avena y miel, apto para piel sensible. Hecho a mano en tandas chicas.',
variants: [],
stock: 'disponible',
delivery: 'retiro',
img: 'img/hogar-jabon.jpg'
},
{
id: 'difusor-savia',
name: 'Difusor Savia',
category: 'Cuidado y Hogar',
price: 1190,
desc: 'Difusor de varillas con notas verdes y cítricas. Perfuma el ambiente por semanas.',
variants: [],
stock: 'disponible',
delivery: 'ambos',
img: 'img/hogar-difusor.jpg'
}
]
};
