import { useEffect, useMemo, useState } from 'react';
import {
  formatarFormaPagamento,
  formatarTipo,
  initStorage,
  recuperarTodasDespesas,
} from '../services/storage';

initStorage();

const MESES_LABEL = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const CHART_COLORS = ['#22d3ee', '#f472b6', '#facc15', '#60a5fa', '#34d399', '#fb923c'];

function toMoneyNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatMoney(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseMonthControlValue(monthControlValue) {
  const [year, month] = monthControlValue.split('-');
  return {
    year,
    month: String(Number.parseInt(month, 10)),
  };
}

function startMonthValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function shiftMonthValue(monthControlValue, delta) {
  const [year, month] = monthControlValue.split('-').map((value) => Number.parseInt(value, 10));
  const shifted = new Date(year, month - 1 + delta, 1);
  const shiftedMonth = String(shifted.getMonth() + 1).padStart(2, '0');
  return `${shifted.getFullYear()}-${shiftedMonth}`;
}

function toMonthControlValue(year, month) {
  return `${year}-${String(Number.parseInt(month, 10)).padStart(2, '0')}`;
}

function buildPolylinePoints(values, width, height, padding) {
  if (values.length === 0) return '';

  const max = Math.max(...values, 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * usableWidth;
      const y = height - padding - (value / max) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [monthControlValue, setMonthControlValue] = useState(startMonthValue);
  const [hoveredSixMonth, setHoveredSixMonth] = useState(null);
  const [hoveredNextSixMonth, setHoveredNextSixMonth] = useState(null);
  const [isDailyDetailOpen, setIsDailyDetailOpen] = useState(false);
  const [hoveredDailyPoint, setHoveredDailyPoint] = useState(null);
  const [selectedDailyPoint, setSelectedDailyPoint] = useState(null);
  const [despesas] = useState(() => recuperarTodasDespesas());

  useEffect(() => {
    if (!isDailyDetailOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDailyDetailOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDailyDetailOpen]);

  const { year: selectedYear, month: selectedMonth } = useMemo(
    () => parseMonthControlValue(monthControlValue),
    [monthControlValue],
  );

  const despesasDoMes = useMemo(() => {
    return despesas
      .filter(
        (despesa) => despesa.ano === selectedYear && String(Number(despesa.mes)) === selectedMonth,
      )
      .map((despesa) => ({
        ...despesa,
        valorNumero: toMoneyNumber(despesa.valor),
      }));
  }, [despesas, selectedMonth, selectedYear]);

  const despesasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return despesasDoMes;

    return despesasDoMes.filter((despesa) => {
      const dataLabel = `${String(despesa.dia).padStart(2, '0')}/${String(despesa.mes).padStart(2, '0')}/${despesa.ano}`;
      const tipoLabel = formatarTipo(despesa.tipo);
      const pagamentoLabel = formatarFormaPagamento(despesa.formaPagamento);

      return (
        despesa.descricao.toLowerCase().includes(term) ||
        dataLabel.includes(term) ||
        tipoLabel.toLowerCase().includes(term) ||
        pagamentoLabel.toLowerCase().includes(term)
      );
    });
  }, [despesasDoMes, search]);

  const tipoDistribution = useMemo(() => {
    const totals = despesasDoMes.reduce((acc, despesa) => {
      const key = formatarTipo(despesa.tipo);
      acc[key] = (acc[key] ?? 0) + despesa.valorNumero;
      return acc;
    }, {});

    const totalMes = Object.values(totals).reduce((sum, value) => sum + value, 0);
    const entries = Object.entries(totals).map(([label, total], index) => ({
      label,
      total,
      percentage: totalMes > 0 ? (total / totalMes) * 100 : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    let running = 0;
    const segments = entries.map((entry) => {
      const start = running;
      running += entry.percentage;
      return `${entry.color} ${start.toFixed(2)}% ${running.toFixed(2)}%`;
    });

    return {
      entries,
      totalMes,
      background:
        segments.length > 0
          ? `conic-gradient(${segments.join(', ')})`
          : 'conic-gradient(#334155 0 100%)',
    };
  }, [despesasDoMes]);

  const dailyLineChart = useMemo(() => {
    const monthNumber = Number.parseInt(selectedMonth, 10);
    const yearNumber = Number.parseInt(selectedYear, 10);
    const daysInMonth = new Date(yearNumber, monthNumber, 0).getDate();
    const dailyTotals = Array.from({ length: daysInMonth }, () => 0);

    despesasDoMes.forEach((despesa) => {
      const dayIndex = Number.parseInt(despesa.dia, 10) - 1;
      if (dayIndex >= 0 && dayIndex < daysInMonth) {
        dailyTotals[dayIndex] += despesa.valorNumero;
      }
    });

    return {
      daysInMonth,
      dailyTotals,
      maxValue: Math.max(...dailyTotals, 0),
    };
  }, [despesasDoMes, selectedMonth, selectedYear]);

  const paymentTotals = useMemo(() => {
    const grouped = despesasDoMes.reduce((acc, despesa) => {
      const label = formatarFormaPagamento(despesa.formaPagamento);
      acc[label] = (acc[label] ?? 0) + despesa.valorNumero;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
  }, [despesasDoMes]);

  const sixMonthsChart = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const labels = [];

    for (let offset = 6; offset >= 1; offset -= 1) {
      const reference = new Date(currentYear, currentMonth - 1 - offset, 1);
      labels.push({
        year: String(reference.getFullYear()),
        month: String(reference.getMonth() + 1),
        label: `${MESES_LABEL[reference.getMonth()]}/${String(reference.getFullYear()).slice(-2)}`,
      });
    }

    const points = labels.map((item) => {
      const total = despesas.reduce((sum, despesa) => {
        if (despesa.ano === item.year && String(Number(despesa.mes)) === item.month) {
          return sum + toMoneyNumber(despesa.valor);
        }
        return sum;
      }, 0);

      return {
        ...item,
        total,
      };
    });

    return {
      points,
      maxTotal: Math.max(...points.map((point) => point.total), 0),
    };
  }, [despesas]);

  const nextSixMonthsChart = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const labels = [];

    for (let offset = 1; offset <= 6; offset += 1) {
      const reference = new Date(currentYear, currentMonth - 1 + offset, 1);
      labels.push({
        year: String(reference.getFullYear()),
        month: String(reference.getMonth() + 1),
        label: `${MESES_LABEL[reference.getMonth()]}/${String(reference.getFullYear()).slice(-2)}`,
      });
    }

    const points = labels.map((item) => {
      const total = despesas.reduce((sum, despesa) => {
        if (despesa.ano === item.year && String(Number(despesa.mes)) === item.month) {
          return sum + toMoneyNumber(despesa.valor);
        }
        return sum;
      }, 0);

      return {
        ...item,
        total,
      };
    });

    return {
      points,
      maxTotal: Math.max(...points.map((point) => point.total), 0),
    };
  }, [despesas]);

  const linePoints = buildPolylinePoints(dailyLineChart.dailyTotals, 420, 170, 18);
  const totalFiltrado = despesasDoMes.reduce((sum, despesa) => sum + despesa.valorNumero, 0);
  const maxPaymentTotal = paymentTotals[0]?.total ?? 0;
  const detailedDailyData = dailyLineChart.dailyTotals.map((total, index) => ({
    day: index + 1,
    total,
  }));
  const modalChart = useMemo(() => {
    const width = Math.max(860, detailedDailyData.length * 28);
    const height = 280;
    const padding = { top: 18, right: 18, bottom: 38, left: 56 };
    const usableWidth = width - padding.left - padding.right;
    const usableHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(dailyLineChart.maxValue, 1);

    const points = detailedDailyData.map((item, index) => {
      const x = padding.left + (index / Math.max(detailedDailyData.length - 1, 1)) * usableWidth;
      const y = padding.top + (1 - item.total / maxValue) * usableHeight;
      return { ...item, x, y };
    });

    const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => ({
      value: maxValue * ratio,
      y: padding.top + (1 - ratio) * usableHeight,
    }));

    return {
      width,
      height,
      padding,
      points,
      polyline,
      yTicks,
    };
  }, [dailyLineChart.maxValue, detailedDailyData]);
  const despesasDiaSelecionado = useMemo(() => {
    if (!selectedDailyPoint) return [];

    return despesasDoMes
      .filter((despesa) => Number.parseInt(despesa.dia, 10) === selectedDailyPoint.day)
      .sort((a, b) => b.valorNumero - a.valorNumero);
  }, [despesasDoMes, selectedDailyPoint]);

  return (
    <main className="synth-page synth-dashboard">
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame synth-dashboard__frame">
          <header className="synth-hero synth-dashboard__hero">
            <h1 className="synth-title">Dashboard de Gastos</h1>
            <p className="synth-hero__subtitle">
              Visao consolidada por mes, com evolucao diaria e comportamento dos ultimos meses.
            </p>
          </header>

          <div className="synth-dashboard__layout">
            <div className="synth-dashboard__left">
              <div className="synth-dashboard__stack">
                <div className="synth-dashboard__card">
                  <label
                    htmlFor="dashboard-month"
                    className="synth-label synth-dashboard__field-label"
                  >
                    Selecione o mes
                  </label>
                  <input
                    id="dashboard-month"
                    type="month"
                    value={monthControlValue}
                    onChange={(event) => setMonthControlValue(event.target.value)}
                    className="synth-control synth-dashboard__month-input"
                  />
                  <div className="synth-dashboard__month-actions">
                    <button
                      type="button"
                      onClick={() => setMonthControlValue((prev) => shiftMonthValue(prev, -1))}
                      className="synth-dashboard__ghost-btn"
                    >
                      Mes anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonthControlValue((prev) => shiftMonthValue(prev, 1))}
                      className="synth-dashboard__ghost-btn"
                    >
                      Proximo mes
                    </button>
                  </div>
                  <p className="synth-dashboard__hint">
                    Total no mes: {formatMoney(totalFiltrado)}
                  </p>
                </div>

                <div className="synth-dashboard__card">
                  <h2 className="synth-dashboard__card-title">
                    Percentual por tipo (mes selecionado)
                  </h2>

                  <div className="synth-dashboard__type-chart">
                    <div
                      className="synth-dashboard__donut"
                      style={{ background: tipoDistribution.background }}
                    >
                      <div className="synth-dashboard__donut-core" />
                    </div>

                    <div className="synth-dashboard__legend">
                      {tipoDistribution.entries.length === 0 && (
                        <p className="synth-dashboard__empty-note">
                          Sem dados para o mes selecionado.
                        </p>
                      )}
                      {tipoDistribution.entries.map((entry) => (
                        <div key={entry.label} className="synth-dashboard__legend-item">
                          <span
                            className="synth-dashboard__legend-dot"
                            style={{ backgroundColor: entry.color }}
                            aria-hidden="true"
                          />
                          <span>{entry.label}</span>
                          <span className="synth-dashboard__legend-value">
                            ({entry.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="synth-dashboard__card">
                  <div className="synth-dashboard__card-head">
                    <h2 className="synth-dashboard__card-title">Linha: total de gastos por dia</h2>
                    <button
                      type="button"
                      onClick={() => setIsDailyDetailOpen(true)}
                      className="synth-dashboard__ghost-btn"
                    >
                      Detalhado
                    </button>
                  </div>

                  {dailyLineChart.maxValue === 0 ? (
                    <p className="synth-dashboard__empty-note">
                      Sem dados para montar a linha neste mes.
                    </p>
                  ) : (
                    <>
                      <svg viewBox="0 0 420 170" className="synth-dashboard__line-svg">
                        <line x1="18" y1="152" x2="402" y2="152" stroke="rgba(103,242,255,0.35)" />
                        <polyline
                          points={linePoints}
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="synth-dashboard__axis-caption">
                        <span>Dia 1</span>
                        <span>Dia {dailyLineChart.daysInMonth}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="synth-dashboard__card">
                  <h2 className="synth-dashboard__card-title">
                    Total por forma de pagamento (mes selecionado)
                  </h2>

                  {paymentTotals.length === 0 ? (
                    <p className="synth-dashboard__empty-note">
                      Sem gastos para agrupar no mes selecionado.
                    </p>
                  ) : (
                    <ul className="synth-dashboard__payment-list">
                      {paymentTotals.map((item) => {
                        const widthPercent =
                          maxPaymentTotal > 0
                            ? Math.max((item.total / maxPaymentTotal) * 100, 8)
                            : 8;

                        return (
                          <li key={item.label} className="synth-dashboard__payment-item">
                            <div className="synth-dashboard__payment-row">
                              <span>{item.label}</span>
                              <strong className="synth-dashboard__payment-total">
                                {formatMoney(item.total)}
                              </strong>
                            </div>
                            <div className="synth-dashboard__payment-track">
                              <div
                                className="synth-dashboard__payment-fill"
                                style={{ width: `${widthPercent}%` }}
                                aria-hidden="true"
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="synth-dashboard__card">
                  <h2 className="synth-dashboard__card-title">Gastos dos ultimos 6 meses</h2>

                  <div className="synth-dashboard__six-month-grid">
                    {sixMonthsChart.points.map((point) => {
                      const percentage =
                        sixMonthsChart.maxTotal > 0
                          ? Math.max((point.total / sixMonthsChart.maxTotal) * 100, 4)
                          : 4;
                      const pointId = `${point.year}-${point.month}`;

                      return (
                        <div key={pointId} className="synth-dashboard__month-col">
                          <div className="synth-dashboard__month-bar-wrap">
                            <div
                              role="img"
                              tabIndex={0}
                              className="synth-dashboard__month-bar"
                              style={{ height: `${percentage}%` }}
                              onClick={() =>
                                setMonthControlValue(toMonthControlValue(point.year, point.month))
                              }
                              onMouseEnter={() => {
                                setHoveredSixMonth({
                                  id: pointId,
                                  label: point.label,
                                  total: point.total,
                                });
                              }}
                              onMouseLeave={() => setHoveredSixMonth(null)}
                              onFocus={() => {
                                setHoveredSixMonth({
                                  id: pointId,
                                  label: point.label,
                                  total: point.total,
                                });
                              }}
                              onBlur={() => setHoveredSixMonth(null)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setMonthControlValue(
                                    toMonthControlValue(point.year, point.month),
                                  );
                                }
                              }}
                              aria-label={`Total gasto em ${point.label}: ${formatMoney(point.total)}`}
                            />
                            {hoveredSixMonth?.id === pointId && (
                              <div className="synth-dashboard__tooltip-six-month-inline">
                                <span className="synth-dashboard__tooltip-label">
                                  Total gasto
                                </span>
                                <strong className="synth-dashboard__tooltip-value">
                                  {formatMoney(point.total)}
                                </strong>
                                <span className="synth-dashboard__tooltip-month">
                                  {point.label}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="synth-dashboard__month-label">{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="synth-dashboard__card">
                  <h2 className="synth-dashboard__card-title">Previsão: próximos 6 meses</h2>

                  <div className="synth-dashboard__six-month-grid">
                    {nextSixMonthsChart.points.map((point) => {
                      const percentage =
                        nextSixMonthsChart.maxTotal > 0
                          ? Math.max((point.total / nextSixMonthsChart.maxTotal) * 100, 4)
                          : 4;
                      const pointId = `next-${point.year}-${point.month}`;

                      return (
                        <div key={pointId} className="synth-dashboard__month-col">
                          <div className="synth-dashboard__month-bar-wrap">
                            <div
                              role="img"
                              tabIndex={0}
                              className="synth-dashboard__month-bar"
                              style={{ height: `${percentage}%` }}
                              onClick={() =>
                                setMonthControlValue(toMonthControlValue(point.year, point.month))
                              }
                              onMouseEnter={() => {
                                setHoveredNextSixMonth({
                                  id: pointId,
                                  label: point.label,
                                  total: point.total,
                                });
                              }}
                              onMouseLeave={() => setHoveredNextSixMonth(null)}
                              onFocus={() => {
                                setHoveredNextSixMonth({
                                  id: pointId,
                                  label: point.label,
                                  total: point.total,
                                });
                              }}
                              onBlur={() => setHoveredNextSixMonth(null)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setMonthControlValue(
                                    toMonthControlValue(point.year, point.month),
                                  );
                                }
                              }}
                              aria-label={`Total gasto em ${point.label}: ${formatMoney(point.total)}`}
                            />
                            {hoveredNextSixMonth?.id === pointId && (
                              <div className="synth-dashboard__tooltip-six-month-inline">
                                <span className="synth-dashboard__tooltip-label">
                                  Total gasto
                                </span>
                                <strong className="synth-dashboard__tooltip-value">
                                  {formatMoney(point.total)}
                                </strong>
                                <span className="synth-dashboard__tooltip-month">
                                  {point.label}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="synth-dashboard__month-label">{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="synth-dashboard__right">
              <div className="synth-dashboard__results">
                <div className="synth-dashboard__search-wrap">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por descricao, tipo, forma de pagamento ou data"
                    className="synth-control synth-dashboard__search"
                  />
                </div>

                <div className="synth-table-wrap synth-dashboard__table-shell">
                  <table className="synth-table synth-dashboard__table">
                    <thead className="synth-dashboard__thead">
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Pagamento</th>
                        <th>Descricao</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesasFiltradas.length === 0 && (
                        <tr>
                          <td colSpan={5} className="synth-table__empty">
                            Nenhum gasto encontrado para o mes selecionado.
                          </td>
                        </tr>
                      )}

                      {[...despesasFiltradas]
                        .sort((a, b) => {
                          const aTime = new Date(
                            Number.parseInt(a.ano, 10),
                            Number.parseInt(a.mes, 10) - 1,
                            Number.parseInt(a.dia, 10),
                          ).getTime();
                          const bTime = new Date(
                            Number.parseInt(b.ano, 10),
                            Number.parseInt(b.mes, 10) - 1,
                            Number.parseInt(b.dia, 10),
                          ).getTime();
                          return bTime - aTime;
                        })
                        .map((despesa) => (
                          <tr key={despesa.id}>
                            <td>
                              {`${String(despesa.dia).padStart(2, '0')}/${String(despesa.mes).padStart(2, '0')}/${despesa.ano}`}
                            </td>
                            <td>{formatarTipo(despesa.tipo)}</td>
                            <td>{formatarFormaPagamento(despesa.formaPagamento)}</td>
                            <td>{despesa.descricao}</td>
                            <td>{formatMoney(despesa.valorNumero)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isDailyDetailOpen && (
        <div
          className="synth-dashboard__modal-backdrop"
          onClick={() => setIsDailyDetailOpen(false)}
          role="presentation"
        >
          <div
            className="synth-dashboard__modal synth-dashboard__modal--lg"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Detalhamento do grafico diario"
          >
            <div className="synth-dashboard__modal-head">
              <h2 className="synth-dashboard__modal-title">
                Evolucao diaria detalhada - {String(selectedMonth).padStart(2, '0')}/{selectedYear}
              </h2>
              <button
                type="button"
                className="synth-dashboard__ghost-btn"
                onClick={() => {
                  setIsDailyDetailOpen(false);
                  setSelectedDailyPoint(null);
                }}
              >
                Fechar
              </button>
            </div>

            <div className="synth-dashboard__modal-chart-wrap">
              <div className="synth-dashboard__modal-chart-shell">
                <svg
                  viewBox={`0 0 ${modalChart.width} ${modalChart.height}`}
                  className="synth-dashboard__modal-chart"
                >
                  {modalChart.yTicks.map((tick) => (
                    <g key={`tick-${tick.y}`}>
                      <line
                        x1={modalChart.padding.left}
                        y1={tick.y}
                        x2={modalChart.width - modalChart.padding.right}
                        y2={tick.y}
                        stroke="rgba(103,242,255,0.14)"
                        strokeDasharray="4 5"
                      />
                      <text
                        x={modalChart.padding.left - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="rgba(186,230,253,0.85)"
                      >
                        {formatMoney(tick.value)}
                      </text>
                    </g>
                  ))}

                  <line
                    x1={modalChart.padding.left}
                    y1={modalChart.height - modalChart.padding.bottom}
                    x2={modalChart.width - modalChart.padding.right}
                    y2={modalChart.height - modalChart.padding.bottom}
                    stroke="rgba(103,242,255,0.35)"
                  />

                  {modalChart.polyline && (
                    <polyline
                      points={modalChart.polyline}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {modalChart.points.map((point) => (
                    <g key={`point-${point.day}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#67e8f9"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDailyPoint(point)}
                        onMouseLeave={() => setHoveredDailyPoint(null)}
                        onClick={() => setSelectedDailyPoint(point)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedDailyPoint(point);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Abrir gastos do dia ${String(point.day).padStart(2, '0')}`}
                      />
                    </g>
                  ))}

                  {modalChart.points.map((point, index) => {
                    const labelStep =
                      detailedDailyData.length <= 15 ? 1 : detailedDailyData.length <= 31 ? 2 : 3;
                    if (index % labelStep !== 0 && index !== modalChart.points.length - 1)
                      return null;

                    return (
                      <text
                        key={`label-${point.day}`}
                        x={point.x}
                        y={modalChart.height - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fill="rgba(186,230,253,0.8)"
                      >
                        {String(point.day).padStart(2, '0')}
                      </text>
                    );
                  })}
                </svg>

                {hoveredDailyPoint && (
                  <div
                    className="synth-dashboard__tooltip synth-dashboard__tooltip--local"
                    style={{ left: hoveredDailyPoint.x, top: hoveredDailyPoint.y - 6 }}
                  >
                    Dia {String(hoveredDailyPoint.day).padStart(2, '0')}:{' '}
                    {formatMoney(hoveredDailyPoint.total)}
                  </div>
                )}
              </div>
            </div>

            <div className="synth-dashboard__stats-grid">
              <div className="synth-dashboard__stat-item">
                Total do mes: {formatMoney(totalFiltrado)}
              </div>
              <div className="synth-dashboard__stat-item">
                Maior gasto diario: {formatMoney(dailyLineChart.maxValue)}
              </div>
              <div className="synth-dashboard__stat-item">
                Dias no mes: {dailyLineChart.daysInMonth}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDailyPoint && (
        <div
          className="synth-dashboard__modal-backdrop synth-dashboard__modal-backdrop--top"
          onClick={() => setSelectedDailyPoint(null)}
          role="presentation"
        >
          <div
            className="synth-dashboard__modal synth-dashboard__modal--md"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Gastos do dia selecionado"
          >
            <div className="synth-dashboard__modal-head">
              <h3 className="synth-dashboard__modal-title">
                Gastos do dia {String(selectedDailyPoint.day).padStart(2, '0')}/
                {String(selectedMonth).padStart(2, '0')}/{selectedYear}
              </h3>
              <button
                type="button"
                className="synth-dashboard__ghost-btn"
                onClick={() => setSelectedDailyPoint(null)}
              >
                Fechar
              </button>
            </div>

            <div className="synth-table-wrap synth-dashboard__day-table-wrap">
              <table className="synth-table synth-dashboard__day-table">
                <thead className="synth-dashboard__thead">
                  <tr>
                    <th>Tipo</th>
                    <th>Pagamento</th>
                    <th>Descricao</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasDiaSelecionado.length === 0 && (
                    <tr>
                      <td colSpan={4} className="synth-table__empty">
                        Nenhum gasto encontrado para este dia.
                      </td>
                    </tr>
                  )}

                  {despesasDiaSelecionado.map((despesa) => (
                    <tr key={`dia-${despesa.id}`}>
                      <td>{formatarTipo(despesa.tipo)}</td>
                      <td>{formatarFormaPagamento(despesa.formaPagamento)}</td>
                      <td>{despesa.descricao}</td>
                      <td>{formatMoney(despesa.valorNumero)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
