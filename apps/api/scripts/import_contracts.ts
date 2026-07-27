import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  {
    "clientName": "Hering",
    "startDate": "2025-12-12",
    "endDate": null,
    "monthlyValue": 3400.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David | Instagram: https://www.instagram.com/hering.stm/"
  },
  {
    "clientName": "Diego Reale",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David | Instagram: https://www.instagram.com/dr.diegoreale/"
  },
  {
    "clientName": "Prudentte Lima Inc",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 425.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David | Instagram: https://www.instagram.com/prudenttelimaincorporadora/"
  },
  {
    "clientName": "Igor Maximiano Adv",
    "startDate": "2026-04-14",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David | Instagram: https://www.instagram.com/igormaximiano.adv/"
  },
  {
    "clientName": "João Matheus Advogado",
    "startDate": "2025-08-26",
    "endDate": null,
    "monthlyValue": 1275.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David | Instagram: https://www.instagram.com/joaomgomesadv/"
  },
  {
    "clientName": "Prudentte Lima Imóveis",
    "startDate": "2022-06-20",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David | Instagram: https://www.instagram.com/prudenttelimaincorporadora/"
  },
  {
    "clientName": "Dra Ana Luíza",
    "startDate": "2026-05-22",
    "endDate": null,
    "monthlyValue": 2975.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: David"
  },
  {
    "clientName": "Cartão Eco",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1020.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/cartaoeco/"
  },
  {
    "clientName": "Recanto do Amanhã",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/pax.recanto/"
  },
  {
    "clientName": "Sanclin",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 4080.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/sanclinoficial/"
  },
  {
    "clientName": "Via Marconi",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1870.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/fiatviamarconi/"
  },
  {
    "clientName": "Way Jeep Ram",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1870.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/jeepwayoficial/"
  },
  {
    "clientName": "Magiofer",
    "startDate": "2026-01-15",
    "endDate": null,
    "monthlyValue": 2720.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/magioferhomecenter/"
  },
  {
    "clientName": "Maria do Carmo",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 9500.0,
    "taxPercentage": 0.0,
    "geePercentage": 31.5789,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Julia | Instagram: https://www.instagram.com/mariadocarmo.stm/"
  },
  {
    "clientName": "Arantes",
    "startDate": "2026-03-09",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/institutoarantes/"
  },
  {
    "clientName": "Murylo Oliveira",
    "startDate": "2026-02-10",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/muryloliveira/"
  },
  {
    "clientName": "Centro de terapias PH",
    "startDate": "2026-04-14",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/centrodeterapiasph/"
  },
  {
    "clientName": "Bill Car",
    "startDate": "2024-07-26",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/billcarrentacar/"
  },
  {
    "clientName": "Distribuidora Durães",
    "startDate": "2025-08-01",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/distribuidoraduraes.stm/"
  },
  {
    "clientName": "Campo Belo",
    "startDate": "2025-08-05",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/campo_bello_construtora/"
  },
  {
    "clientName": "CRD",
    "startDate": "2026-01-12",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/crdstm26/"
  },
  {
    "clientName": "Hotel Oliver",
    "startDate": "2026-05-15",
    "endDate": null,
    "monthlyValue": 2805.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Kidney | Instagram: https://www.instagram.com/hoteloliverinhouse/"
  },
  {
    "clientName": "Essencial Informática",
    "startDate": "2025-08-26",
    "endDate": null,
    "monthlyValue": 4250.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/essencial_santarem/"
  },
  {
    "clientName": "Hamburgueria Muiraquitã",
    "startDate": "2026-04-14",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/mburgerhouse/"
  },
  {
    "clientName": "Nunes Barbearia",
    "startDate": "2026-01-01",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 0.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/nunesbarbeariaebemestar/"
  },
  {
    "clientName": "Tapajós Skate Shop",
    "startDate": "2025-08-26",
    "endDate": null,
    "monthlyValue": 1275.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/tapajosskateshop2/"
  },
  {
    "clientName": "Veneta",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1955.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/venetaacai/"
  },
  {
    "clientName": "Boto Gelateria",
    "startDate": "2024-01-22",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/botogelato/"
  },
  {
    "clientName": "Dr Renato Auzier",
    "startDate": "2026-04-01",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/dr.renatoauzier/"
  },
  {
    "clientName": "Maximus",
    "startDate": "2023-06-09",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/maximussantarem/"
  },
  {
    "clientName": "NEW MÓVEIS",
    "startDate": "2024-02-20",
    "endDate": null,
    "monthlyValue": 2040.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/newsantarem/"
  },
  {
    "clientName": "Machado Lima",
    "startDate": "2025-04-23",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/machadolimaempreendimentos/"
  },
  {
    "clientName": "Instituto Bruno Moura",
    "startDate": "2024-05-14",
    "endDate": null,
    "monthlyValue": 3825.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/institutobrunomoura/"
  },
  {
    "clientName": "25 de Março",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2500.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": ""
  },
  {
    "clientName": "Casa do Saulo",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2000.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Amanda"
  },
  {
    "clientName": "BeloAlter (Casa do Saulo)",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2000.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Amanda"
  },
  {
    "clientName": "Bangalo da Selva",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1400.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Amanda"
  },
  {
    "clientName": "Intermed",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 4000.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Julia | Instagram: https://www.instagram.com/intermedpa/"
  },
  {
    "clientName": "GUI360",
    "startDate": "2025-04-22",
    "endDate": null,
    "monthlyValue": 1500.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Julia"
  },
  {
    "clientName": "Box 47",
    "startDate": "2025-09-18",
    "endDate": null,
    "monthlyValue": 1800.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Julia | Instagram: https://www.instagram.com/box47lounge/"
  },
  {
    "clientName": "Boliche To Na Pista",
    "startDate": "2025-09-18",
    "endDate": null,
    "monthlyValue": 1800.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Julia | Instagram: https://www.instagram.com/bolichetonapistastm/"
  },
  {
    "clientName": "Lugs",
    "startDate": "2025-10-01",
    "endDate": null,
    "monthlyValue": 1800.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Julia | Instagram: https://www.instagram.com/lugscampinagrande/"
  },
  {
    "clientName": "Sucaria sabor da fruta",
    "startDate": "2025-09-01",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/sucariasaborda_fruta/"
  },
  {
    "clientName": "Dental Unic",
    "startDate": "2025-09-01",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/dental.unic.odontologia/"
  },
  {
    "clientName": "Equi Máquinas (1Mês)",
    "startDate": "2025-09-01",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 0.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila"
  },
  {
    "clientName": "Sushi Santarem",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/sushisantarem/"
  },
  {
    "clientName": "Predileta (1 Mês)",
    "startDate": "2025-01-02",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 0.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila"
  },
  {
    "clientName": "Elinelson",
    "startDate": "2025-09-08",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/elinelsonlima1976/"
  },
  {
    "clientName": "Loja do Cartucho",
    "startDate": "2023-06-27",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/lojadocartuchostm/"
  },
  {
    "clientName": "Zenf",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 800.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila"
  },
  {
    "clientName": "Gelateria pinguin",
    "startDate": "2025-10-07",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/pinguin.mendonca/"
  },
  {
    "clientName": "Urbano Norte",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1500.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila"
  },
  {
    "clientName": "Tiago Malvão Nutricionista",
    "startDate": "2025-07-16",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/tiagomalvaonut/"
  },
  {
    "clientName": "Unicurso",
    "startDate": "2025-06-25",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila"
  },
  {
    "clientName": "UDI Murakami",
    "startDate": "2025-10-14",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/clinica_udimurakami"
  },
  {
    "clientName": "Equilibrium Vestibulares",
    "startDate": "2025-11-03",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/equilibriumvestibulares/"
  },
  {
    "clientName": "Nexus Distribuidora",
    "startDate": "2025-11-06",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila"
  },
  {
    "clientName": "QG do Iphone",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1500.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi"
  },
  {
    "clientName": "Mercado do Bairro",
    "startDate": "2025-01-02",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/mercadodobairrostm/"
  },
  {
    "clientName": "A Mesa Certa Podcast",
    "startDate": "2025-08-19",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi"
  },
  {
    "clientName": "Gustavo Veículos",
    "startDate": "2025-09-01",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/gustavoveiculos.stm/"
  },
  {
    "clientName": "Precisa",
    "startDate": "2025-04-04",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/precisa.engenharia/"
  },
  {
    "clientName": "Sócias da Experiencia",
    "startDate": "2024-07-05",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi"
  },
  {
    "clientName": "Dr. Marcos Ariel",
    "startDate": "2025-07-15",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/dr.marcosariel/"
  },
  {
    "clientName": "Horizonte Park",
    "startDate": "2025-10-08",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/horizontepark/"
  },
  {
    "clientName": "Tapajós Prime Residence",
    "startDate": "2025-10-08",
    "endDate": null,
    "monthlyValue": 1700.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/tapajosprime/"
  },
  {
    "clientName": "Bobs",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2000.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": ""
  },
  {
    "clientName": "Tapajos Extintores",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1600.0,
    "taxPercentage": 0.0,
    "geePercentage": 5.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": ""
  },
  {
    "clientName": "Estudio Arco",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 2200.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi"
  },
  {
    "clientName": "Intermed Norte",
    "startDate": "2025-12-22",
    "endDate": null,
    "monthlyValue": 4000.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Julia | Instagram: https://www.instagram.com/intermednorteoficial/"
  },
  {
    "clientName": "Up&Up",
    "startDate": "2025-08-19",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "active",
    "notes": "Instagram: https://www.instagram.com/upeupmktdigital/"
  },
  {
    "clientName": "Dr. Luis Manoel",
    "startDate": "2025-09-01",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Jéssica | Instagram: https://www.instagram.com/dr.luizmanuel/"
  },
  {
    "clientName": "Kish Monteiro",
    "startDate": "2026-02-05",
    "endDate": null,
    "monthlyValue": 2550.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/clinicamonteirokishi/"
  },
  {
    "clientName": "Macedo Engenharia",
    "startDate": "2023-10-24",
    "endDate": null,
    "monthlyValue": 2210.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/macedoengenharia.stm/"
  },
  {
    "clientName": "Serlem Monteiro pessoal",
    "startDate": "2026-03-13",
    "endDate": null,
    "monthlyValue": 2125.0,
    "taxPercentage": 0.0,
    "geePercentage": 17.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Ludimila | Instagram: https://www.instagram.com/serlenmonteirokishi/"
  },
  {
    "clientName": "Dr. Bruno Pessoal",
    "startDate": "2025-08-05",
    "endDate": null,
    "monthlyValue": 0.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/dr.bmoura/"
  },
  {
    "clientName": "DX Empire",
    "startDate": "2026-03-10",
    "endDate": null,
    "monthlyValue": 3000.0,
    "taxPercentage": 0.0,
    "geePercentage": 33.3333,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/clinicalempire/"
  },
  {
    "clientName": "Dxtra",
    "startDate": "2025-01-01",
    "endDate": null,
    "monthlyValue": 1360.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/dxtrainc/"
  },
  {
    "clientName": "Raphael Advogado",
    "startDate": "2025-02-05",
    "endDate": null,
    "monthlyValue": 1500.0,
    "taxPercentage": 0.0,
    "geePercentage": 15.0,
    "geeFixedValue": 0.0,
    "status": "inactive",
    "notes": "GEE: Rosi | Instagram: https://www.instagram.com/raphaelmachadoadv/"
  }
];

async function run() {
  const clients = await prisma.client.findMany();
  const users = await prisma.user.findMany();

  let matched = 0;
  let notFound = 0;

  for (const item of data) {
    // Try to find client by name (fuzzy)
    const client = clients.find(c => 
      c.tradeName.toLowerCase().includes(item.clientName.toLowerCase()) || 
      (c.legalName && c.legalName.toLowerCase().includes(item.clientName.toLowerCase()))
    );

    if (client) {
      matched++;
      // Update Client status and instagramUrl if provided in notes
      let instagramUrl = client.instagramUrl;
      const instaMatch = item.notes.match(/Instagram: (https?:\/\/[^\s]+)/);
      if (instaMatch) {
        instagramUrl = instaMatch[1];
      }

      await prisma.client.update({
        where: { id: client.id },
        data: {
          monthlyContractValue: item.monthlyValue,
          status: item.status as any,
          instagramUrl
        }
      });

      // Find existing contract or create one
      const existingContract = await prisma.contract.findFirst({
        where: { clientId: client.id }
      });

      if (existingContract) {
        await prisma.contract.update({
          where: { id: existingContract.id },
          data: {
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
            monthlyValue: item.monthlyValue,
            taxPercentage: item.taxPercentage,
            geePercentage: item.geePercentage,
            geeFixedValue: item.geeFixedValue,
            status: item.status as any,
            notes: item.notes
          }
        });
      } else {
        await prisma.contract.create({
          data: {
            clientId: client.id,
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
            monthlyValue: item.monthlyValue,
            taxPercentage: item.taxPercentage,
            geePercentage: item.geePercentage,
            geeFixedValue: item.geeFixedValue,
            status: item.status as any,
            notes: item.notes
          }
        });
      }

      // If notes say "GEE: Nome", assign GEE
      const geeMatch = item.notes.match(/GEE: ([\wáàâãéèêíïóôõöúçñ]+)/i);
      if (geeMatch) {
        const geeName = geeMatch[1].trim();
        const geeUser = users.find(u => u.name.toLowerCase().includes(geeName.toLowerCase()));
        if (geeUser) {
          // Check if already assigned
          const existingTeam = await prisma.clientTeamMember.findUnique({
            where: {
              clientId_userId_role: {
                clientId: client.id,
                userId: geeUser.id,
                role: 'GEE'
              }
            }
          });
          if (!existingTeam) {
            await prisma.clientTeamMember.create({
              data: {
                clientId: client.id,
                userId: geeUser.id,
                role: 'GEE'
              }
            });
            console.log(`Assigned GEE ${geeUser.name} to ${client.tradeName}`);
          }
        } else {
          console.log(`GEE not found in system: ${geeName} for client ${client.tradeName}`);
        }
      }
      
      console.log(`Updated client: ${client.tradeName}`);
    } else {
      notFound++;
      console.log(`Client NOT FOUND: ${item.clientName}`);
    }
  }

  console.log(`Done! Matched: ${matched}, Not Found: ${notFound}`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
