/**
 * チャート管理クラス
 * 
 * 機能:
 * - Chart.jsを使用したチャートの作成と管理
 * - 嗜好性分析チャート
 * - カテゴリ分布チャート
 * - 価格vs満足度チャート
 * - チャートの動的更新
 */

class ChartManager {
  constructor(app) {
    this.app = app;
    this.charts = {};
    this.chartConfigs = this.getChartConfigs();
    this.init();
  }

  /**
   * チャート管理の初期化
   */
  init() {
    try {
      // Chart.jsのグローバル設定
      Chart.defaults.font.family = 'var(--font-family)';
      Chart.defaults.font.size = 12;
      Chart.defaults.color = 'var(--color-text-secondary)';
      Chart.defaults.plugins.legend.labels.usePointStyle = true;
      Chart.defaults.plugins.legend.labels.padding = 20;
      
      console.log('チャート管理を初期化しました');
    } catch (error) {
      console.error('チャート管理の初期化に失敗しました:', error);
    }
  }

  /**
   * チャート設定の取得
   * @returns {Object} チャート設定
   */
  getChartConfigs() {
    return {
      scatter: {
        type: 'scatter',
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              ticks: {
                color: 'var(--color-text-secondary)'
              },
              grid: {
                color: 'var(--color-neutral-300)'
              }
            },
            y: {
              ticks: {
                color: 'var(--color-text-secondary)'
              },
              grid: {
                color: 'var(--color-neutral-300)'
              }
            }
          }
        }
      }
    };
  }

  /**
   * チャートの初期化
   */
  initializeCharts() {
    try {
      console.log('チャートを初期化中...');
      
      // データを取得
      const data = this.app.dataManager.getData();
      
      if (!data || !data.clothingItems || data.clothingItems.length === 0) {
        console.log('データがないため、空のチャートを表示します');
        this.showEmptyCharts();
        return;
      }

      console.log(`${data.clothingItems.length}件のデータでチャートを更新します`);
      
      // 各チャートを更新
      this.updateEmotionColorChart(data.clothingItems);
      this.updateEmotionPriceChart(data.clothingItems);
      this.updateFitSilhouetteChart(data.clothingItems);
      this.updateValuesPriceChart(data.clothingItems);
      this.updateFitPriceChart(data.clothingItems);
      
      console.log('チャートの初期化が完了しました');
      
    } catch (error) {
      console.error('チャートの初期化に失敗しました:', error);
    }
  }

  /**
   * 感情 vs 配色チャートの更新
   * @param {Array} items - アイテム配列
   */
  updateEmotionColorChart(items) {
    try {
      const canvas = document.getElementById('emotionColorChart');
      if (!canvas) {
        console.warn('emotionColorChartのキャンバスが見つかりません');
        return;
      }

      // 既存のチャートを破棄
      if (this.charts.emotionColor) {
        this.charts.emotionColor.destroy();
      }

      // データを準備
      const chartData = this.prepareEmotionColorData(items);
      
      // チャートを作成
      this.charts.emotionColor = new Chart(canvas, {
        type: 'scatter',
        data: chartData,
        options: {
          ...this.chartConfigs.scatter.options,
          plugins: {
            ...this.chartConfigs.scatter.options.plugins,
            title: {
              display: true,
              text: '感情 vs 配色',
              font: { size: 14, weight: 'bold' },
              color: 'var(--color-text-primary)'
            }
          },
          scales: {
            x: {
              ...this.chartConfigs.scatter.options.scales.x,
              title: {
                display: true,
                text: '色相 (0-360)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 360
            },
            y: {
              ...this.chartConfigs.scatter.options.scales.y,
              title: {
                display: true,
                text: '感情評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            }
          }
        }
      });

      console.log('感情 vs 配色チャートを更新しました');

    } catch (error) {
      console.error('感情 vs 配色チャートの更新に失敗しました:', error);
    }
  }

  /**
   * 感情 vs 値段チャートの更新
   * @param {Array} items - アイテム配列
   */
  updateEmotionPriceChart(items) {
    try {
      const canvas = document.getElementById('emotionPriceChart');
      if (!canvas) {
        console.warn('emotionPriceChartのキャンバスが見つかりません');
        return;
      }

      // 既存のチャートを破棄
      if (this.charts.emotionPrice) {
        this.charts.emotionPrice.destroy();
      }

      // データを準備
      const chartData = this.prepareEmotionPriceData(items);
      
      // チャートを作成
      this.charts.emotionPrice = new Chart(canvas, {
        type: 'scatter',
        data: chartData,
        options: {
          ...this.chartConfigs.scatter.options,
          plugins: {
            ...this.chartConfigs.scatter.options.plugins,
            title: {
              display: true,
              text: '感情 vs 値段',
              font: { size: 14, weight: 'bold' },
              color: 'var(--color-text-primary)'
            }
          },
          scales: {
            x: {
              ...this.chartConfigs.scatter.options.scales.x,
              title: {
                display: true,
                text: '価格評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            },
            y: {
              ...this.chartConfigs.scatter.options.scales.y,
              title: {
                display: true,
                text: '感情評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            }
          }
        }
      });

      console.log('感情 vs 値段チャートを更新しました');

    } catch (error) {
      console.error('感情 vs 値段チャートの更新に失敗しました:', error);
    }
  }

  /**
   * フィット感 vs シルエットチャートの更新
   * @param {Array} items - アイテム配列
   */
  updateFitSilhouetteChart(items) {
    try {
      const canvas = document.getElementById('fitSilhouetteChart');
      if (!canvas) {
        console.warn('fitSilhouetteChartのキャンバスが見つかりません');
        return;
      }

      // 既存のチャートを破棄
      if (this.charts.fitSilhouette) {
        this.charts.fitSilhouette.destroy();
      }

      // データを準備
      const chartData = this.prepareFitSilhouetteData(items);
      
      // チャートを作成
      this.charts.fitSilhouette = new Chart(canvas, {
        type: 'scatter',
        data: chartData,
        options: {
          ...this.chartConfigs.scatter.options,
          plugins: {
            ...this.chartConfigs.scatter.options.plugins,
            title: {
              display: true,
              text: 'フィット感 vs シルエット',
              font: { size: 14, weight: 'bold' },
              color: 'var(--color-text-primary)'
            }
          },
          scales: {
            x: {
              ...this.chartConfigs.scatter.options.scales.x,
              title: {
                display: true,
                text: 'シルエット評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            },
            y: {
              ...this.chartConfigs.scatter.options.scales.y,
              title: {
                display: true,
                text: 'フィット感評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            }
          }
        }
      });

      console.log('フィット感 vs シルエットチャートを更新しました');

    } catch (error) {
      console.error('フィット感 vs シルエットチャートの更新に失敗しました:', error);
    }
  }

  /**
   * 個人的な価値観・こだわり vs 値段チャートの更新
   * @param {Array} items - アイテム配列
   */
  updateValuesPriceChart(items) {
    try {
      const canvas = document.getElementById('valuesPriceChart');
      if (!canvas) {
        console.warn('valuesPriceChartのキャンバスが見つかりません');
        return;
      }

      // 既存のチャートを破棄
      if (this.charts.valuesPrice) {
        this.charts.valuesPrice.destroy();
      }

      // データを準備
      const chartData = this.prepareValuesPriceData(items);
      
      // チャートを作成
      this.charts.valuesPrice = new Chart(canvas, {
        type: 'scatter',
        data: chartData,
        options: {
          ...this.chartConfigs.scatter.options,
          plugins: {
            ...this.chartConfigs.scatter.options.plugins,
            title: {
              display: true,
              text: '個人的な価値観・こだわり vs 値段',
              font: { size: 14, weight: 'bold' },
              color: 'var(--color-text-primary)'
            }
          },
          scales: {
            x: {
              ...this.chartConfigs.scatter.options.scales.x,
              title: {
                display: true,
                text: '価格評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            },
            y: {
              ...this.chartConfigs.scatter.options.scales.y,
              title: {
                display: true,
                text: '価値観評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            }
          }
        }
      });

      console.log('個人的な価値観・こだわり vs 値段チャートを更新しました');

    } catch (error) {
      console.error('個人的な価値観・こだわり vs 値段チャートの更新に失敗しました:', error);
    }
  }

  /**
   * フィット感 vs 値段チャートの更新
   * @param {Array} items - アイテム配列
   */
  updateFitPriceChart(items) {
    try {
      const canvas = document.getElementById('fitPriceChart');
      if (!canvas) {
        console.warn('fitPriceChartのキャンバスが見つかりません');
        return;
      }

      // 既存のチャートを破棄
      if (this.charts.fitPrice) {
        this.charts.fitPrice.destroy();
      }

      // データを準備
      const chartData = this.prepareFitPriceData(items);
      
      // チャートを作成
      this.charts.fitPrice = new Chart(canvas, {
        type: 'scatter',
        data: chartData,
        options: {
          ...this.chartConfigs.scatter.options,
          plugins: {
            ...this.chartConfigs.scatter.options.plugins,
            title: {
              display: true,
              text: 'フィット感 vs 値段',
              font: { size: 14, weight: 'bold' },
              color: 'var(--color-text-primary)'
            }
          },
          scales: {
            x: {
              ...this.chartConfigs.scatter.options.scales.x,
              title: {
                display: true,
                text: '価格評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            },
            y: {
              ...this.chartConfigs.scatter.options.scales.y,
              title: {
                display: true,
                text: 'フィット感評価 (0-100)',
                color: 'var(--color-text-primary)'
              },
              min: 0,
              max: 100
            }
          }
        }
      });

      console.log('フィット感 vs 値段チャートを更新しました');

    } catch (error) {
      console.error('フィット感 vs 値段チャートの更新に失敗しました:', error);
    }
  }

  /**
   * 感情 vs 配色データの準備
   * @param {Array} items - アイテム配列
   * @returns {Object} チャートデータ
   */
  prepareEmotionColorData(items) {
    try {
      const data = items
        .filter(item => item.colorHue !== undefined && item.emotion !== undefined)
        .map(item => ({
          x: item.colorHue,
          y: item.emotion,
          name: item.name,
          category: item.category
        }));

      return {
        datasets: [{
          label: '感情 vs 配色',
          data: data,
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: 'rgba(33, 150, 243, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      };

    } catch (error) {
      console.error('感情 vs 配色データの準備に失敗しました:', error);
      return { datasets: [] };
    }
  }

  /**
   * 感情 vs 値段データの準備
   * @param {Array} items - アイテム配列
   * @returns {Object} チャートデータ
   */
  prepareEmotionPriceData(items) {
    try {
      const data = items
        .filter(item => item.price !== undefined && item.emotion !== undefined)
        .map(item => ({
          x: item.price,
          y: item.emotion,
          name: item.name,
          category: item.category
        }));

      return {
        datasets: [{
          label: '感情 vs 値段',
          data: data,
          backgroundColor: 'rgba(255, 193, 7, 0.6)',
          borderColor: 'rgba(255, 193, 7, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      };

    } catch (error) {
      console.error('感情 vs 値段データの準備に失敗しました:', error);
      return { datasets: [] };
    }
  }

  /**
   * フィット感 vs シルエットデータの準備
   * @param {Array} items - アイテム配列
   * @returns {Object} チャートデータ
   */
  prepareFitSilhouetteData(items) {
    try {
      const data = items
        .filter(item => item.silhouetteValue !== undefined && item.fitValue !== undefined)
        .map(item => ({
          x: item.silhouetteValue,
          y: item.fitValue,
          name: item.name,
          category: item.category
        }));

      return {
        datasets: [{
          label: 'フィット感 vs シルエット',
          data: data,
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgba(76, 175, 80, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      };

    } catch (error) {
      console.error('フィット感 vs シルエットデータの準備に失敗しました:', error);
      return { datasets: [] };
    }
  }

  /**
   * 個人的な価値観・こだわり vs 値段データの準備
   * @param {Array} items - アイテム配列
   * @returns {Object} チャートデータ
   */
  prepareValuesPriceData(items) {
    try {
      const data = items
        .filter(item => item.price !== undefined && item.values !== undefined)
        .map(item => ({
          x: item.price,
          y: item.values,
          name: item.name,
          category: item.category
        }));

      return {
        datasets: [{
          label: '価値観 vs 値段',
          data: data,
          backgroundColor: 'rgba(156, 39, 176, 0.6)',
          borderColor: 'rgba(156, 39, 176, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      };

    } catch (error) {
      console.error('個人的な価値観・こだわり vs 値段データの準備に失敗しました:', error);
      return { datasets: [] };
    }
  }

  /**
   * フィット感 vs 値段データの準備
   * @param {Array} items - アイテム配列
   * @returns {Object} チャートデータ
   */
  prepareFitPriceData(items) {
    try {
      const data = items
        .filter(item => item.price !== undefined && item.fitValue !== undefined)
        .map(item => ({
          x: item.price,
          y: item.fitValue,
          name: item.name,
          category: item.category
        }));

      return {
        datasets: [{
          label: 'フィット感 vs 値段',
          data: data,
          backgroundColor: 'rgba(255, 87, 34, 0.6)',
          borderColor: 'rgba(255, 87, 34, 1)',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      };

    } catch (error) {
      console.error('フィット感 vs 値段データの準備に失敗しました:', error);
      return { datasets: [] };
    }
  }

  /**
   * 空のチャートを表示
   */
  showEmptyCharts() {
    try {
      const chartIds = [
        'emotionColorChart',
        'emotionPriceChart', 
        'fitSilhouetteChart',
        'valuesPriceChart',
        'fitPriceChart'
      ];
      
      chartIds.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
          // 既存のチャートを破棄
          const chartKey = chartId.replace('Chart', '');
          if (this.charts[chartKey]) {
            this.charts[chartKey].destroy();
          }
          
          // 空の状態を表示
          const wrapper = canvas.parentElement;
          wrapper.innerHTML = `
            <div class="empty-chart">
              <div class="empty-chart-icon">📊</div>
              <p>データが不足しています</p>
              <small>より多くのデータを追加すると、チャートが表示されます</small>
            </div>
          `;
        }
      });

      console.log('空のチャートを表示しました');

    } catch (error) {
      console.error('空のチャート表示に失敗しました:', error);
    }
  }

  /**
   * すべてのチャートを更新
   * @param {Object} data - チャートデータ
   */
  updateAllCharts(data) {
    try {
      if (!data || !data.clothingItems || data.clothingItems.length === 0) {
        this.showEmptyCharts();
        return;
      }

      // 各チャートを更新
      this.updateEmotionColorChart(data.clothingItems);
      this.updateEmotionPriceChart(data.clothingItems);
      this.updateFitSilhouetteChart(data.clothingItems);
      this.updateValuesPriceChart(data.clothingItems);
      this.updateFitPriceChart(data.clothingItems);
      
    } catch (error) {
      console.error('チャートの更新に失敗しました:', error);
    }
  }

  /**
   * チャートの破棄
   */
  destroyCharts() {
    try {
      Object.values(this.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      this.charts = {};
      console.log('チャートを破棄しました');
    } catch (error) {
      console.error('チャートの破棄に失敗しました:', error);
    }
  }

  /**
   * チャートのリサイズ
   */
  resizeCharts() {
    try {
      Object.values(this.charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
          chart.resize();
        }
      });
    } catch (error) {
      console.error('チャートのリサイズに失敗しました:', error);
    }
  }
}

// グローバルインスタンスを作成
window.ChartManager = ChartManager; 