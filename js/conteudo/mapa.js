/* Linhas e estações do mapa. ["m", missão, nível, rótulo] abre uma missão de M. */
const LINES = [
 {id:"L1", c:"--c8", tag:"Educação literária", name:"Os Lusíadas", st:[["m","lusiadas",1,"Lição"],["m","lusiadas",2,"Médio"],["m","lusiadas",3,"Nível teste"]]},
 {id:"L2", c:"--c7", tag:"PRI 1 · Leitura", name:"Compreensão do texto", st:[["m","leitura",1,"Lição"],["m","leitura",2,"Médio"],["m","leitura",3,"Nível teste"]]},
 {id:"L3", c:"--c1", tag:"Gramática", name:"Classes e subclasses", st:[["m","classes",1,"Lição"],["m","classes",2,"Médio"],["m","classes",3,"Nível teste"]]},
 {id:"L4", c:"--c2", tag:"Gramática", name:"Funções sintáticas", st:[["m","funcoes",1,"Lição"],["m","funcoes",2,"Médio"],["m","funcoes",3,"Nível teste"]]},
 {id:"L5", c:"--c3", tag:"Gramática", name:"Orações", st:[["m","oracoes",1,"Lição"],["m","oracoes",2,"Médio"],["m","oracoes",3,"Nível teste"]]},
 {id:"L6", c:"--c4", tag:"Gramática", name:"Coesão", st:[["m","coesao",1,"Lição"],["m","coesao",2,"Médio"],["m","coesao",3,"Nível teste"]]},
 {id:"L7", c:"--c5", tag:"Gramática", name:"Relações semânticas", st:[["m","relacoes",1,"Lição"],["m","relacoes",2,"Médio"],["m","relacoes",3,"Nível teste"]]},
 {id:"L8", c:"--c6", tag:"Gramática", name:"Formação de palavras", st:[["m","formacao",1,"Lição"],["m","formacao",2,"Médio"],["m","formacao",3,"Nível teste"]]},
 {id:"L9", c:"--c2", tag:"Como no teste", name:"Exercícios tipo teste", st:[["m","testeA",0,"Teste A"],["m","testeB",0,"Teste B"],["m","testeC",0,"Teste C"],["m","testeD",0,"Teste D"],["m","testeE",0,"Teste E"],["m","testeF",0,"Teste F"],["m","testeG",0,"Teste G"],["m","testeH",0,"Teste H"]]},
 {id:"L13", c:"--c4", tag:"Exames nacionais · IAVE", name:"Gramática dos exames", st:[["m","e21a",0,"2021 F1"],["m","e22a",0,"2022 F1"],["m","e22b",0,"2022 F2"],["m","e23a",0,"2023 F1"],["m","e23b",0,"2023 F2"],["m","e24a",0,"2024 F1"],["m","e24b",0,"2024 F2"],["m","e25a",0,"2025 F1"],["m","e25b",0,"2025 F2"]]},
 {id:"L10", c:"--c3", tag:"Resposta restrita", name:"Justifica como no teste", st:JUST.map((j,i)=>["j",i,0,"J"+(i+1)])},
 {id:"L11", c:"--c8", tag:"PRI 2 · Escrita", name:"Texto de opinião", st:[["m","opiniao",1,"Regras"],["m","opiniao",2,"Médio"],["m","opiniao",3,"Nível teste"],["w",0,0,"Escrever"]]},
 {id:"L12", c:"--c7", tag:"Revisão", name:"Treino e cábula", st:[["inf",0,0,"Treino infinito"],["sim",0,0,"Simulado"],["cab",0,0,"Cábula"]]}
];

