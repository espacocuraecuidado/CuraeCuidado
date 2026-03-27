import product1 from "@/assets/product-1.jpg";
import product3 from "@/assets/product-3.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import heroBaby from "@/assets/hero-baby.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  text: string;
  rating: number;
  service: string;
}

export interface ProfessionalAd {
  id: string;
  name: string;
  specialty: string;
  description: string;
  image: string;
}

const images = [product1, product3, product5, product6, heroBaby];

export const featuredProducts: Product[] = [
  { id: "1", name: "Creme Hidratante Maternal", description: "Hidratação profunda para pele sensível", price: 89.90, image: product1, rating: 4.8, reviews: 124, stock: 15, category: "destaque" },
  { id: "2", name: "Sabonete Líquido Orgânico", description: "Fórmula suave e natural", price: 45.90, image: product3, rating: 4.6, reviews: 89, stock: 3, category: "destaque" },
  { id: "3", name: "Chá Pós-Parto Relaxante", description: "Blend de ervas para recuperação", price: 34.90, image: product5, rating: 4.9, reviews: 201, stock: 42, category: "destaque" },
  { id: "4", name: "Óleo Essencial Lavanda", description: "Aromaterapia para mãe e bebê", price: 62.90, image: product6, rating: 4.7, reviews: 156, stock: 28, category: "destaque" },
  { id: "5", name: "Kit Cuidados Especiais", description: "Conjunto completo de cuidados", price: 159.90, image: product1, rating: 5.0, reviews: 67, stock: 8, category: "destaque" },
];

export const babyProducts: Product[] = [
  { id: "b1", name: "Shampoo Suave Bebê", description: "Sem lágrimas, fórmula delicada", price: 32.90, image: product3, rating: 4.8, reviews: 312, stock: 50, category: "bebê" },
  { id: "b2", name: "Óleo de Massagem Infantil", description: "Para momentos de carinho", price: 48.90, image: product6, rating: 4.9, reviews: 198, stock: 4, category: "bebê" },
  { id: "b3", name: "Creme Protetor", description: "Proteção contra assaduras", price: 29.90, image: product1, rating: 4.5, reviews: 456, stock: 35, category: "bebê" },
  { id: "b4", name: "Água de Colônia Suave", description: "Fragrância delicada para bebê", price: 38.90, image: product3, rating: 4.7, reviews: 87, stock: 22, category: "bebê" },
  { id: "b5", name: "Kit Higiene Completo", description: "Tudo que o bebê precisa", price: 119.90, image: product5, rating: 4.6, reviews: 145, stock: 2, category: "bebê" },
];

export const momProducts: Product[] = [
  { id: "m1", name: "Cinta Pós-Parto", description: "Conforto e suporte", price: 129.90, image: product1, rating: 4.4, reviews: 234, stock: 18, category: "mamãe" },
  { id: "m2", name: "Chá de Amamentação", description: "Estimula a produção de leite", price: 28.90, image: product5, rating: 4.8, reviews: 567, stock: 60, category: "mamãe" },
  { id: "m3", name: "Almofada de Amamentação", description: "Ergonômica e macia", price: 189.90, image: heroBaby, rating: 4.9, reviews: 321, stock: 12, category: "mamãe" },
  { id: "m4", name: "Creme Anti-Estrias", description: "Prevenção e tratamento", price: 76.90, image: product1, rating: 4.6, reviews: 189, stock: 30, category: "mamãe" },
  { id: "m5", name: "Vitaminas Pré-Natal", description: "Suplementação completa", price: 54.90, image: product6, rating: 4.7, reviews: 412, stock: 45, category: "mamãe" },
];

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Maria Silva", avatar: "MS", text: "A Dra. Ana foi maravilhosa no acompanhamento pré-natal. Me senti acolhida e segura durante toda a gestação!", rating: 5, service: "Acompanhamento Pré-Natal" },
  { id: "t2", name: "Juliana Santos", avatar: "JS", text: "Os produtos são de altíssima qualidade! Meu bebê ama o óleo de massagem, dormimos muito melhor.", rating: 5, service: "Produtos para Bebê" },
  { id: "t3", name: "Carla Oliveira", avatar: "CO", text: "Fiz o curso de amamentação e mudou completamente minha experiência. Recomendo demais!", rating: 5, service: "Curso de Amamentação" },
  { id: "t4", name: "Fernanda Lima", avatar: "FL", text: "Atendimento humanizado de verdade. A equipe toda é muito carinhosa e profissional.", rating: 4, service: "Consulta Pediátrica" },
  { id: "t5", name: "Patricia Costa", avatar: "PC", text: "Encontrei tudo que precisava para o enxoval em um só lugar. Preços justos e entrega rápida!", rating: 5, service: "Compras Online" },
];

export const professionalAds: ProfessionalAd[] = [
  { id: "p1", name: "Dra. Ana Paula", specialty: "Obstetrícia", description: "Atendimento humanizado para gestantes. Consultas pré-natal com amor e cuidado.", image: product1 },
  { id: "p2", name: "Enf. Beatriz Souza", specialty: "Consultora de Amamentação", description: "Apoio completo na amamentação. Visitas domiciliares disponíveis.", image: product3 },
  { id: "p3", name: "Dra. Carolina Mendes", specialty: "Pediatria", description: "Cuidando do seu bebê com carinho e competência desde o primeiro dia.", image: product5 },
  { id: "p4", name: "Fisio. Daniela Rocha", specialty: "Fisioterapia Pélvica", description: "Recuperação pós-parto e preparação para o parto com exercícios especializados.", image: product6 },
];

export const categoryNames = {
  featured: "✨ Destaques",
  testimonials: "💬 Depoimentos",
  baby: "👶 Produtos para Bebês",
  mom: "🤱 Produtos para Mamães",
  professionals: "👩‍⚕️ Nossos Profissionais",
};
