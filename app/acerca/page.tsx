import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { UnPanel } from '@/components/layout/Paneles';

export const metadata: Metadata = { title: 'Acerca del método' };

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-ink">{titulo}</h2>
      {children}
    </section>
  );
}

const p = 'text-sm text-ink-muted';

const PARAMETROS: [string, string, string][] = [
  [
    'Representación',
    'Entera: 13 genes, índice de la hora de inicio de cada sesión',
    'Katoch et al. (2021)',
  ],
  [
    'Cruce',
    'Uniforme, pc = 0,80 (alternativas: un punto y dos puntos)',
    'Katoch et al. (2021); Hussain et al. (2017)',
  ],
  ['Mutación', 'Uniforme sobre un gen, pm = 0,10', 'Katoch et al. (2021); Hussain et al. (2017)'],
  [
    'Selección',
    'Torneo de tamaño 3 con reglas de Deb (alternativa: ruleta)',
    'Miller y Goldberg (1995); Lagaros et al. (2023)',
  ],
  ['Elitismo', 'e = 1: el mejor individuo pasa intacto', 'Rudolph (1994)'],
  [
    'Población y parada',
    'N = 150 y 500 generaciones; opcional por estancamiento o al alcanzar el óptimo',
    'Hussain et al. (2017); Larrañaga et al. (1999)',
  ],
];

/* Referencias en APA 7 (las mismas del informe del grupo). */
const REFERENCIAS: ReactNode[] = [
  <>
    Hua, L.-G., Ali Shah, S. H., Alghamdi, B., Hafeez, G., Ullah, S., Murawwat, S., Ali, S., y Khan,
    M. I. (2024). Smart home load scheduling system with solar photovoltaic generation and demand
    response in the smart grid. <i>Frontiers in Energy Research, 12</i>, Artículo 1322047.
    https://doi.org/10.3389/fenrg.2024.1322047
  </>,
  <>
    Hussain, A., Muhammad, Y. S., Nauman Sajid, M., Hussain, I., Mohamd Shoukry, A., y Gani, S.
    (2017). Genetic algorithm for traveling salesman problem with modified cycle crossover operator.{' '}
    <i>Computational Intelligence and Neuroscience, 2017</i>, Artículo 7430125.
    https://doi.org/10.1155/2017/7430125
  </>,
  <>
    Katoch, S., Chauhan, S. S., y Kumar, V. (2021). A review on genetic algorithm: Past, present,
    and future. <i>Multimedia Tools and Applications, 80</i>(5), 8091–8126.
    https://doi.org/10.1007/s11042-020-10139-6
  </>,
  <>
    Lagaros, N. D., Kournoutos, M., Kallioras, N. A., y Nordas, A. N. (2023). Constraint handling
    techniques for metaheuristics: A state-of-the-art review and new variants.{' '}
    <i>Optimization and Engineering, 24</i>(4), 2251–2298.
    https://doi.org/10.1007/s11081-022-09782-9
  </>,
  <>
    Larrañaga, P., Kuijpers, C. M. H., Murga, R. H., Inza, I., y Dizdarevic, S. (1999). Genetic
    algorithms for the travelling salesman problem: A review of representations and operators.{' '}
    <i>Artificial Intelligence Review, 13</i>(2), 129–170. https://doi.org/10.1023/A:1006529012972
  </>,
  <>
    Marler, R. T., y Arora, J. S. (2010). The weighted sum method for multi-objective optimization:
    New insights. <i>Structural and Multidisciplinary Optimization, 41</i>(6), 853–862.
    https://doi.org/10.1007/s00158-009-0460-7
  </>,
  <>
    Miller, B. L., y Goldberg, D. E. (1995). Genetic algorithms, tournament selection, and the
    effects of noise. <i>Complex Systems, 9</i>(3), 193–212.
    https://www.complex-systems.com/abstracts/v09_i03_a02/
  </>,
  <>
    Ministerio de Energía y Minas. (2006). <i>Código Nacional de Electricidad: Utilización</i>{' '}
    (Resolución Ministerial N.° 0037-2006-MEM).
    https://www.gob.pe/institucion/minem/normas-legales/108855-0037-2006-mem
  </>,
  <>
    Ministerio de Energía y Minas. (2020).{' '}
    <i>
      Guía de orientación del uso eficiente de la energía y de diagnóstico energético: Sector
      residencial
    </i>
    .
    https://eficienciaenergetica.minem.gob.pe/Content/fileman/Uploads/Documents/Gu%C3%ADas%202022/GUIA%20SECTOR%20RESIDENCIAL_VF3.pdf
  </>,
  <>
    Naciones Unidas. (2015).{' '}
    <i>Transformar nuestro mundo: La Agenda 2030 para el Desarrollo Sostenible</i> (Resolución
    A/RES/70/1). https://sdgs.un.org/es/2030agenda
  </>,
  <>
    Organismo Supervisor de la Inversión en Energía y Minería. (2013).{' '}
    <i>Resolución de Consejo Directivo N.° 206-2013-OS/CD</i>.
    https://www.osinergmin.gob.pe/Resoluciones/pdf/2013/R_OSINERGMIN_No.206-2013-OS-CD.pdf
  </>,
  <>
    Organismo Supervisor de la Inversión en Energía y Minería. (2023).{' '}
    <i>Resolución de Consejo Directivo N.° 116-2023-OS/CD</i>.
    https://www.osinergmin.gob.pe/Resoluciones/pdf/2023/Osinergmin-116-2023-OS-CD.pdf
  </>,
  <>
    Organismo Supervisor de la Inversión en Energía y Minería. (2026).{' '}
    <i>
      Pliego tarifario máximo del servicio público de electricidad: Pluz Energía Perú, sistema Lima
      Norte, vigente desde el 4 de noviembre de 2026
    </i>
    . Recuperado el 11 de noviembre de 2026, de
    https://www.osinergmin.gob.pe/Tarifas/Electricidad/PliegoTarifario?Id=150000
  </>,
  <>
    Rudolph, G. (1994). Convergence analysis of canonical genetic algorithms.{' '}
    <i>IEEE Transactions on Neural Networks, 5</i>(1), 96–101. https://doi.org/10.1109/72.265964
  </>,
  <>
    Veras, J. M., Silva, I. R. S., Pinheiro, P. R., Rabêlo, R. A. L., Veloso, A. F. S., Borges, F.
    A. S., y Rodrigues, J. J. P. C. (2018). A multi-objective demand response optimization model for
    scheduling loads in a home energy management system. <i>Sensors, 18</i>(10), 3207.
    https://doi.org/10.3390/s18103207
  </>,
];

const EQUIPO = [
  'Aguilar Lobaton, Juan Pablo',
  'Collazos Moreno, Giordano Fabio',
  'Garcia Shimabukuro, Engie',
  'Mejía Caso, Juan Pablo',
  'Valdivia Arias, Angel',
];

export default function PaginaAcerca() {
  return (
    <UnPanel ancho="max-w-3xl" className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">Acerca del método</h1>

      <Seccion titulo="Qué problema resuelve">
        <p className={p}>
          Franja programa el uso semanal de los electrodomésticos que pueden cambiar de hora (terma,
          lavadora, plancha, aspiradora y lustradora) en una vivienda con la tarifa horaria BT5-I.
          Busca que la energía cueste menos, sacando consumo de la franja punta (18:00–23:00), sin
          elevar el pico de demanda ni superar los 5000 W. Continúa los proyectos de sistema experto
          y sistema difuso del grupo sobre el uso eficiente de la energía en el hogar, en línea con
          el Objetivo de Desarrollo Sostenible 7 (Naciones Unidas, 2015).
        </p>
      </Seccion>

      <Seccion titulo="Representación y objetivo">
        <p className={p}>
          Un cromosoma tiene 13 genes enteros, uno por sesión: siete de la terma (una por día), uno
          de la lavadora, tres de la plancha, uno de la aspiradora y uno de la lustradora. Cada gen
          es el índice de la hora de inicio dentro de las horas permitidas de su sesión, así que
          toda solución respeta las franjas por construcción.
        </p>
        <p className={p}>
          El objetivo a minimizar es f = w·C/C<sub>hab</sub> + (1 − w)·PADR/PADR<sub>hab</sub>,
          donde C es el costo semanal de la energía con BT5-I y PADR la razón entre el pico y el
          promedio de la demanda (Hua et al., 2024), ambos normalizados por el horario habitual. Por
          defecto w = 0,5; los pesos expresan preferencias y no deben usarse a ciegas (Marler y
          Arora, 2010).
        </p>
        <p className={p}>
          Las restricciones (demanda horaria de hasta 5000 W y sesiones de un mismo artefacto sin
          superposición) se manejan con las reglas de factibilidad de Deb: una solución factible
          siempre gana a una infactible, entre factibles gana la de menor f y entre infactibles la
          de menor violación (Deb, 2000, como se citó en Lagaros et al., 2023).
        </p>
      </Seccion>

      <Seccion titulo="Componentes y parámetros">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Componentes del algoritmo genético y su respaldo</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-ink-muted">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Componente
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Configuración base
                </th>
                <th scope="col" className="py-2 font-medium">
                  Respaldo
                </th>
              </tr>
            </thead>
            <tbody>
              {PARAMETROS.map(([c, v, r]) => (
                <tr key={c} className="border-b border-border align-top last:border-b-0">
                  <td className="py-1.5 pr-3 text-ink">{c}</td>
                  <td className="py-1.5 pr-3 text-ink-muted">{v}</td>
                  <td className="py-1.5 text-ink-muted">{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={p}>
          El tamaño de torneo 3 se eligió en un ajuste preliminar con 30 semillas. Como existen
          cotas inferiores del costo y del PADR, se sabe cuándo una solución es óptima: el simulador
          lo indica como «óptimo demostrado».
        </p>
      </Seccion>

      <Seccion titulo="Cómo leer las vistas">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>
            Simulador: ejecuta el algoritmo y observa en vivo el horario, la demanda y la
            convergencia.
          </li>
          <li>Corridas: compara las cuatro configuraciones del informe con la misma semilla.</li>
          <li>
            Operadores: aplica un cruce o la mutación a dos horarios y mira de qué padre viene cada
            gen.
          </li>
          <li>
            Caso de estudio: datos oficiales de artefactos y tarifa, y los supuestos declarados del
            caso.
          </li>
        </ul>
        <p className={p}>
          Todo el cálculo ocurre en el backend; esta interfaz solo muestra lo que el backend
          devuelve.
        </p>
      </Seccion>

      <Seccion titulo="Limitaciones">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>
            Las franjas permitidas y los horarios habituales son un supuesto del caso de estudio, no
            un dato oficial.
          </li>
          <li>
            El ahorro posible es acotado porque la mayor parte de la energía (la cocina eléctrica,
            entre otros) no se puede desplazar.
          </li>
          <li>
            El costo considera solo energía y cargo fijo del pliego, sin IGV ni otros conceptos del
            recibo.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="Referencias">
        <ul className="space-y-2 text-sm text-ink-muted">
          {REFERENCIAS.map((r, i) => (
            <li key={i} className="break-words pl-6 -indent-6">
              {r}
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="Equipo">
        <p className={p}>
          Sistemas Inteligentes, Facultad de Ingeniería de Sistemas e Informática, Universidad
          Nacional Mayor de San Marcos. Grupo 6. Docente: Delgadillo Ávila, Rosa Sumactika.
        </p>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
          {EQUIPO.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Seccion>
    </UnPanel>
  );
}
