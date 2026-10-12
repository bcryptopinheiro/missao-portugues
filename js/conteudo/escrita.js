/* Resposta restrita («Justifica como no teste») e texto-modelo de opinião. */
const JUST = [
 {id:"j1", name:"Velho do Restelo", ref:"Os Lusíadas, IV, 95", p:"Explicita a crítica feita pelo Velho do Restelo em «Ó glória de mandar! Ó vã cobiça / Desta vaidade a quem chamamos Fama!».",
  model:"O Velho do Restelo critica a ambição de poder e de fama que levou os portugueses a partir. Através da apóstrofe «Ó glória de mandar! Ó vã cobiça», dirige-se a esses sentimentos como se fossem pessoas e chama-lhes «vã», isto é, inútil. Para ele, essa glória é passageira e só traz «mortes», «perigos» e «tormentas».",
  crit:[["Identifico o que é criticado: a ambição de poder / a cobiça / a fama",4],["Explico porquê: é vã (inútil) e traz sofrimento",3],["Uso pelo menos uma citação curta, entre aspas",3]]},
 {id:"j2", name:"Inês de Castro", ref:"Os Lusíadas, III, 120", p:"Explica o sentido do verso «Naquele engano da alma, ledo e cego».",
  model:"O verso mostra que Inês vivia feliz («ledo») mas iludida («engano», «cego»), sem perceber o perigo que a ameaçava. Essa felicidade não ia durar, porque «a Fortuna não deixa durar muito», o que antecipa a sua morte trágica.",
  crit:[["Refiro a felicidade de Inês («ledo» = alegre)",3],["Refiro que era uma felicidade ilusória (engano, cegueira)",3],["Relaciono com o destino trágico / a morte que se aproxima",4]]},
 {id:"j3", name:"Fragilidade humana", ref:"Os Lusíadas, I, 106", p:"Explica o sentido da expressão «bicho da terra tão pequeno».",
  model:"A expressão é uma metáfora do ser humano. O poeta compara-o a um pequeno bicho para mostrar a sua fragilidade e insignificância perante os perigos do mar e da terra e perante a força do «Céu».",
  crit:[["Digo que a expressão se refere ao ser humano",3],["Identifico o recurso: metáfora",3],["Explico a ideia de fragilidade / pequenez perante os perigos",4]]},
 {id:"j4", name:"Leitura: treino de paciência", ref:"Texto da linha «Compreensão do texto»", p:"Explica por que razão o autor afirma que ler um livro é «um treino de paciência».",
  model:"O autor considera a leitura «um treino de paciência» porque um livro obriga a «seguir um raciocínio longo», ou seja, a manter a atenção durante muito tempo, ao contrário do que acontece quando se salta «de ecrã em ecrã».",
  crit:[["Explico que ler exige atenção / concentração prolongada",4],["Uso uma citação ou referência ao texto",3],["Comparo com a leitura rápida nos ecrãs",3]],
  text:true},
 {id:"j5", name:"Gramática: oração", ref:"Resposta breve de gramática", p:"Classifica a oração destacada e indica a sua função sintática: «É importante <mark>que estudes todos os dias</mark>».",
  model:"Oração subordinada substantiva completiva, com a função sintática de sujeito.",
  crit:[["Classifiquei: subordinada substantiva completiva",6],["Indiquei a função: sujeito",4]]}
];

const MODEL = `Hoje em dia, quase todos os alunos chegam à escola com um telemóvel no bolso. Muitos defendem que estes aparelhos são ferramentas úteis; outros acham que só distraem. Na minha opinião, o uso do telemóvel nas aulas deve ser proibido, embora possa ser permitido nos intervalos.

Em primeiro lugar, o telemóvel prejudica a concentração. Basta uma notificação para que o aluno perca o fio ao raciocínio do professor e, depois, demore vários minutos a voltar a acompanhar a matéria. Por exemplo, quando um colega recebe uma mensagem a meio de uma explicação, não é só ele que se distrai: quem está ao lado também espreita o ecrã, e a turma inteira perde o ritmo. Ora, uma aula interrompida várias vezes rende muito menos.

Além disso, a proibição nas aulas protege a convivência entre colegas. Quando os jovens passam o tempo a olhar para o ecrã, conversam menos, trabalham menos em grupo e isolam-se. Basta observar um intervalo: em vez de conversas e jogos, vemos muitas vezes grupos de amigos em silêncio, cada um agarrado ao seu aparelho. Limitar o telemóvel nas aulas é um primeiro passo para mudar este hábito.

É certo que o telemóvel pode ser útil para pesquisar informação ou usar aplicações educativas. No entanto, a escola dispõe de computadores e de manuais para essas tarefas, e o professor pode autorizar o aparelho em atividades concretas, sem que ele esteja sempre disponível.

Em suma, considero que o telemóvel deve ficar guardado durante as aulas, para que os alunos aprendam com mais atenção e convivam mais uns com os outros. A tecnologia é uma aliada valiosa, mas só quando é usada no momento certo e com um objetivo claro.`;
