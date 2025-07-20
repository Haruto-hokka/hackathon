/**
 * UI管理クラス
 * 
 * 機能:
 * - 統計情報の表示更新
 * - データテーブルの管理
 * - タブの切り替え
 * - UI要素の動的更新
 */

class UIManager {
  constructor(app) {
    this.app = app;
    this.elements = this.cacheElements();
  }

  /**
   * DOM要素のキャッシュ
   * @returns {Object} キャッシュされた要素
   */
  cacheElements() {
    return {
      // 統計要素
      totalItems: document.getElementById('totalItems'),
      avgPreference: document.getElementById('avgPreference'),
      favoriteCategory: document.getElementById('favoriteCategory'),
      totalInvestment: document.getElementById('totalInvestment'),
      
      // テーブル要素
      clothingTable: document.getElementById('clothingTable'),
      clothingTableBody: document.getElementById('clothingTableBody'),
      
      // タブ要素
      tabButtons: document.querySelectorAll('.tab-btn'),
      tabContents: document.querySelectorAll('.tab-content'),
      
      // その他の要素
      exportBtn: document.getElementById('exportBtn'),
      clearDataBtn: document.getElementById('clearDataBtn')
    };
  }

  /**
   * 統計情報の更新
   * @param {Object} statistics - 統計データ
   */
  updateStatistics(statistics) {
    try {
      if (!statistics) {
        console.warn('統計データが提供されていません');
        return;
      }

      // 総アイテム数
      if (this.elements.totalItems) {
        this.elements.totalItems.textContent = statistics.totalItems || 0;
      }

      // 平均好み度
      if (this.elements.avgPreference) {
        const avgPref = statistics.averagePreference || 0;
        this.elements.avgPreference.textContent = avgPref.toFixed(1);
        
        // 色分け
        this.elements.avgPreference.className = 'stat-value';
        if (avgPref > 50) {
          this.elements.avgPreference.classList.add('positive');
        } else if (avgPref < 0) {
          this.elements.avgPreference.classList.add('negative');
        }
      }

      // お気に入りカテゴリ
      if (this.elements.favoriteCategory) {
        const category = statistics.favoriteCategory;
        if (category) {
          this.elements.favoriteCategory.textContent = this.getCategoryDisplayName(category);
        } else {
          this.elements.favoriteCategory.textContent = '-';
        }
      }

      // 総投資額
      if (this.elements.totalInvestment) {
        const investment = statistics.totalInvestment || 0;
        this.elements.totalInvestment.textContent = this.app.formatValue(investment, 'currency');
      }

    } catch (error) {
      console.error('統計情報の更新に失敗しました:', error);
    }
  }

  /**
   * データテーブルの更新
   * @param {Array} items - 服アイテムの配列
   */
  updateTable(items) {
    try {
      if (!this.elements.clothingTableBody) {
        console.warn('テーブルボディ要素が見つかりません');
        return;
      }

      // テーブルをクリア
      this.elements.clothingTableBody.innerHTML = '';

      if (!items || items.length === 0) {
        // データがない場合のメッセージを表示
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="10" class="empty-table-message">
            <div class="empty-state">
              <div class="empty-icon">👕</div>
              <h3>データがありません</h3>
              <p>入力ページから服の情報を追加してください</p>
            </div>
          </td>
        `;
        this.elements.clothingTableBody.appendChild(emptyRow);
        return;
      }

      // アイテムを並び替え（最新順）
      const sortedItems = this.app.dataManager.sortItems(items, 'createdAt', 'desc');

      // テーブル行を生成
      sortedItems.forEach(item => {
        const row = this.createTableRow(item);
        this.elements.clothingTableBody.appendChild(row);
      });

    } catch (error) {
      console.error('データテーブルの更新に失敗しました:', error);
    }
  }

  /**
   * テーブル行の作成
   * @param {Object} item - 服アイテム
   * @returns {HTMLElement} テーブル行要素
   */
  createTableRow(item) {
    const row = document.createElement('tr');
    row.dataset.itemId = item.id;

    // 色の表示
    const colorDisplay = this.createColorDisplay(item.color, item.colorHue);
    
    // 好み度の表示
    const preferenceDisplay = this.createPreferenceDisplay(item.preferences?.overall || 50);
    
    // カテゴリの表示名
    const categoryDisplay = this.getCategoryDisplayName(item.category);

    row.innerHTML = `
      <td>
        <div class="item-name">
          <strong>${this.escapeHtml(item.name)}</strong>
          ${item.brand ? `<br><small class="brand-name">${this.escapeHtml(item.brand)}</small>` : ''}
        </div>
      </td>
      <td>${colorDisplay}</td>
      <td>
        <div class="slider-value-display">
          <div class="slider-bar">
            <div class="slider-fill" style="width: ${item.silhouetteValue || 50}%"></div>
          </div>
          <span>${item.silhouetteValue || 50}</span>
        </div>
      </td>
      <td>
        <div class="slider-value-display">
          <div class="slider-bar">
            <div class="slider-fill" style="width: ${item.materialValue || 50}%"></div>
          </div>
          <span>${item.materialValue || 50}</span>
        </div>
      </td>
      <td>
        <div class="price-brand">
          <div class="price">${this.app.formatValue(item.price || 50, 'currency')}</div>
          ${item.brand ? `<div class="brand">${this.escapeHtml(item.brand)}</div>` : ''}
        </div>
      </td>
      <td>
        <div class="slider-value-display">
          <div class="slider-bar">
            <div class="slider-fill" style="width: ${item.fitValue || 50}%"></div>
          </div>
          <span>${item.fitValue || 50}</span>
        </div>
      </td>
      <td>
        <span class="category-badge category-${item.category || 'other'}">${categoryDisplay}</span>
      </td>
      <td>${this.escapeHtml(item.usageScene || '')}</td>
      <td>${this.escapeHtml(item.personalValues || '')}</td>
      <td>
        <div class="purchase-info">
          ${this.escapeHtml(item.purchaseInfo || '')}
        </div>
      </td>
    `;

    // イベントリスナーを追加
    this.addTableRowEventListeners(row, item);

    return row;
  }

  /**
   * テーブル行にイベントリスナーを追加
   * @param {HTMLElement} row - テーブル行
   * @param {Object} item - アイテムデータ
   */
  addTableRowEventListeners(row, item) {
    // 行クリックで詳細表示
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.table-actions')) {
        this.showItemDetails(item);
      }
    });

    // ホバー効果
    row.addEventListener('mouseenter', () => {
      row.classList.add('row-hover');
    });

    row.addEventListener('mouseleave', () => {
      row.classList.remove('row-hover');
    });
  }

  /**
   * 色の表示を作成
   * @param {string} color - 色の名前
   * @param {number} colorHue - 色相値
   * @returns {string} 色の表示HTML
   */
  createColorDisplay(color, colorHue) {
    if (colorHue !== undefined && colorHue !== null) {
      const hue = colorHue;
      const saturation = 70;
      const lightness = 50;
      const colorValue = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
      return `
        <div class="color-display">
          <div class="color-swatch" style="background-color: ${colorValue}"></div>
          <span class="color-name">${this.escapeHtml(color || '')}</span>
        </div>
      `;
    }
    
    return `
      <div class="color-display">
        <div class="color-swatch color-placeholder"></div>
        <span class="color-name">${this.escapeHtml(color || '')}</span>
      </div>
    `;
  }

  /**
   * 好み度の表示を作成
   * @param {number} preference - 好み度（0-100）
   * @returns {string} 好み度の表示HTML
   */
  createPreferenceDisplay(preference) {
    const value = preference || 50;
    const percentage = Math.min(100, Math.max(0, value));
    
    let colorClass = 'neutral';
    if (percentage >= 70) {
      colorClass = 'positive';
    } else if (percentage >= 40) {
      colorClass = 'neutral';
    } else {
      colorClass = 'negative';
    }
    
    return `
      <div class="preference-display">
        <div class="preference-bar">
          <div class="preference-fill ${colorClass}" style="width: ${percentage}%"></div>
        </div>
        <span class="preference-value">${value}</span>
      </div>
    `;
  }

  /**
   * カテゴリの表示名を取得
   * @param {string} category - カテゴリ
   * @returns {string} 表示名
   */
  getCategoryDisplayName(category) {
    if (!category) return 'その他';
    
    const categoryMap = {
      'tops': 'トップス',
      'bottoms': 'ボトムス',
      'outerwear': 'アウター',
      'dresses': 'ワンピース',
      'shoes': '靴',
      'accessories': 'アクセサリー',
      'underwear': '下着',
      'sportswear': 'スポーツウェア',
      'formal': 'フォーマル',
      'casual': 'カジュアル'
    };
    
    return categoryMap[category.toLowerCase()] || category;
  }

  /**
   * HTMLエスケープ
   * @param {string} text - エスケープするテキスト
   * @returns {string} エスケープされたテキスト
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * アイテムの編集
   * @param {Object} item - 編集するアイテム
   */
  editItem(item) {
    try {
      // 編集モーダルを表示（将来的な実装）
      console.log('アイテムを編集:', item);
      this.app.showModal('編集', `「${item.name}」を編集しますか？`);
    } catch (error) {
      console.error('アイテムの編集に失敗しました:', error);
    }
  }

  /**
   * アイテムの削除
   * @param {Object} item - 削除するアイテム
   */
  deleteItem(item) {
    try {
      this.app.showConfirmDialog(
        `「${item.name}」を削除しますか？`,
        () => {
          this.app.dataManager.deleteClothingItem(item.id);
          this.app.refreshUI();
          this.app.showNotification('アイテムを削除しました', 'success');
        },
        () => {
          console.log('削除をキャンセルしました');
        }
      );
    } catch (error) {
      console.error('アイテムの削除に失敗しました:', error);
    }
  }

  /**
   * アイテムの詳細表示
   * @param {Object} item - 表示するアイテム
   */
  showItemDetails(item) {
    try {
      const details = `
        <div class="item-details">
          <h3>${this.escapeHtml(item.name)}</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>配色:</label>
              <span>${this.escapeHtml(item.color || '')}</span>
            </div>
            <div class="detail-item">
              <label>シルエット:</label>
              <span>${item.silhouetteValue || 50}</span>
            </div>
            <div class="detail-item">
              <label>素材感:</label>
              <span>${item.materialValue || 50}</span>
            </div>
            <div class="detail-item">
              <label>ブランド/値段:</label>
              <span>${this.escapeHtml(item.brand || '')}</span>
            </div>
            <div class="detail-item">
              <label>フィット感:</label>
              <span>${item.fitValue || 50}</span>
            </div>
            <div class="detail-item">
              <label>カテゴリ:</label>
              <span>${this.getCategoryDisplayName(item.category)}</span>
            </div>
            <div class="detail-item">
              <label>使用シーン:</label>
              <span>${this.escapeHtml(item.usageScene || '')}</span>
            </div>
            <div class="detail-item">
              <label>個人的な価値観・こだわり:</label>
              <span>${this.escapeHtml(item.personalValues || '')}</span>
            </div>
            <div class="detail-item">
              <label>購入日/URL:</label>
              <span>${this.escapeHtml(item.purchaseInfo || '')}</span>
            </div>
          </div>
        </div>
      `;
      
      this.app.showModal('詳細', details);
    } catch (error) {
      console.error('アイテム詳細の表示に失敗しました:', error);
    }
  }

  /**
   * テーブルのソート
   * @param {string} column - ソートする列
   * @param {string} order - ソート順序
   */
  sortTable(column, order = 'asc') {
    try {
      const items = this.app.dataManager.getAllClothingItems();
      const sortedItems = this.app.dataManager.sortItems(items, column, order);
      this.updateTable(sortedItems);
    } catch (error) {
      console.error('テーブルのソートに失敗しました:', error);
    }
  }

  /**
   * テーブルの検索
   * @param {string} query - 検索クエリ
   * @param {Object} filters - フィルター条件
   */
  searchTable(query, filters = {}) {
    try {
      const results = this.app.dataManager.searchItems(query, filters);
      this.updateTable(results);
    } catch (error) {
      console.error('テーブルの検索に失敗しました:', error);
    }
  }

  /**
   * ローディング状態の設定
   * @param {boolean} isLoading - ローディング状態
   */
  setLoadingState(isLoading) {
    try {
      const table = this.elements.clothingTable;
      if (!table) return;

      if (isLoading) {
        table.classList.add('loading');
        if (this.elements.clothingTableBody) {
          this.elements.clothingTableBody.innerHTML = `
            <tr>
              <td colspan="10" class="loading-message">
                <div class="loading-spinner"></div>
                <span>データを読み込み中...</span>
              </td>
            </tr>
          `;
        }
      } else {
        table.classList.remove('loading');
      }
    } catch (error) {
      console.error('ローディング状態の設定に失敗しました:', error);
    }
  }

  /**
   * エラー状態の表示
   * @param {string} message - エラーメッセージ
   */
  showErrorState(message) {
    try {
      if (this.elements.clothingTableBody) {
        this.elements.clothingTableBody.innerHTML = `
          <tr>
            <td colspan="10" class="error-message">
              <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>エラーが発生しました</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="btn btn-primary retry-btn" onclick="location.reload()">
                  再読み込み
                </button>
              </div>
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error('エラー状態の表示に失敗しました:', error);
    }
  }

  /**
   * 空の状態の表示
   * @param {string} message - メッセージ
   * @param {string} icon - アイコン
   */
  showEmptyState(message, icon = '📦') {
    try {
      if (this.elements.clothingTableBody) {
        this.elements.clothingTableBody.innerHTML = `
          <tr>
            <td colspan="10" class="empty-message">
              <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <h3>データがありません</h3>
                <p>${this.escapeHtml(message)}</p>
              </div>
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error('空の状態の表示に失敗しました:', error);
    }
  }

  /**
   * 成功状態の表示
   * @param {string} message - メッセージ
   * @param {string} icon - アイコン
   */
  showSuccessState(message, icon = '✅') {
    try {
      if (this.elements.clothingTableBody) {
        this.elements.clothingTableBody.innerHTML = `
          <tr>
            <td colspan="10" class="success-message">
              <div class="success-state">
                <div class="success-icon">${icon}</div>
                <h3>成功</h3>
                <p>${this.escapeHtml(message)}</p>
              </div>
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error('成功状態の表示に失敗しました:', error);
    }
  }

  /**
   * おすすめタブの更新
   * @param {Array} recommendations - おすすめアイテムの配列
   */
  updateRecommendations(recommendations) {
    try {
      console.log('おすすめタブを更新中...');
      
      const recommendSection = document.getElementById('recommend-conditions-section');
      if (!recommendSection) {
        console.warn('おすすめセクションが見つかりません');
        return;
      }

      if (!recommendations || recommendations.length === 0) {
        this.showEmptyRecommendations(recommendSection);
        return;
      }

      // おすすめカードを生成
      const cardsHTML = recommendations.map(item => this.createRecommendationCard(item)).join('');
      
      recommendSection.innerHTML = `
        <div class="recommend-cards">
          ${cardsHTML}
        </div>
      `;

      console.log(`${recommendations.length}件のおすすめアイテムを表示しました`);

    } catch (error) {
      console.error('おすすめタブの更新に失敗しました:', error);
    }
  }

  /**
   * おすすめカードを作成
   * @param {Object} item - おすすめアイテム
   * @returns {string} カードのHTML
   */
  createRecommendationCard(item) {
    try {
      // 色の表示
      const colorDisplay = this.createColorDisplay(item.colorName, item.colorHue);
      
      // マッチスコアの表示
      const matchScoreDisplay = this.createMatchScoreDisplay(item.matchScore);
      
      // カテゴリバッジ
      const categoryBadge = `<span class="category-badge category-${item.category}">${item.categoryDisplay}</span>`;

      return `
        <div class="recommend-card" data-item-id="${item.id}">
          <div class="product-image">
            <div class="placeholder-image">${item.categoryDisplay}</div>
            ${colorDisplay}
            ${categoryBadge}
          </div>
          <div class="product-info">
            <h4 class="product-name">${this.escapeHtml(item.name)}</h4>
            <p class="product-brand">ブランド: ${this.escapeHtml(item.brand)}</p>
            <p class="product-price">金額: ${this.escapeHtml(item.price)}</p>
            <p class="product-category">カテゴリ: ${this.escapeHtml(item.categoryDisplay)}</p>
            <p class="product-color">色: ${this.escapeHtml(item.colorName)}</p>
            ${matchScoreDisplay}
            <p class="product-description">${this.escapeHtml(item.description)}</p>
            <div class="product-actions">
              <button class="btn btn-primary btn-sm" onclick="window.open('${item.url}', '_blank')">
                詳細を見る
              </button>
              <button class="btn btn-secondary btn-sm" onclick="this.app.uiManager.showRecommendationDetails('${item.id}')">
                詳細情報
              </button>
            </div>
          </div>
        </div>
      `;

    } catch (error) {
      console.error('おすすめカードの作成に失敗しました:', error);
      return this.createDefaultRecommendationCard(item);
    }
  }

  /**
   * デフォルトのおすすめカードを作成
   * @param {Object} item - おすすめアイテム
   * @returns {string} カードのHTML
   */
  createDefaultRecommendationCard(item) {
    return `
      <div class="recommend-card" data-item-id="${item.id}">
        <div class="product-image">
          <div class="placeholder-image">Tシャツ</div>
        </div>
        <div class="product-info">
          <h4 class="product-name">${this.escapeHtml(item.name)}</h4>
          <p class="product-brand">ブランド: ${this.escapeHtml(item.brand)}</p>
          <p class="product-price">金額: ${this.escapeHtml(item.price)}</p>
          <p class="product-url">URL: ${this.escapeHtml(item.url)}</p>
        </div>
      </div>
    `;
  }

  /**
   * マッチスコアの表示を作成
   * @param {number} score - マッチスコア（0-100）
   * @returns {string} マッチスコアの表示HTML
   */
  createMatchScoreDisplay(score) {
    const value = score || 75;
    const percentage = Math.min(100, Math.max(0, value));
    
    let colorClass = 'neutral';
    let label = '普通';
    
    if (percentage >= 85) {
      colorClass = 'excellent';
      label = '優秀';
    } else if (percentage >= 70) {
      colorClass = 'good';
      label = '良好';
    } else if (percentage >= 50) {
      colorClass = 'neutral';
      label = '普通';
    } else {
      colorClass = 'poor';
      label = '低い';
    }
    
    return `
      <div class="match-score-display">
        <div class="match-score-label">マッチ度: ${label}</div>
        <div class="match-score-bar">
          <div class="match-score-fill ${colorClass}" style="width: ${percentage}%"></div>
        </div>
        <span class="match-score-value">${value}%</span>
      </div>
    `;
  }

  /**
   * 空のおすすめ状態を表示
   * @param {HTMLElement} container - コンテナ要素
   */
  showEmptyRecommendations(container) {
    try {
      container.innerHTML = `
        <div class="empty-recommendations">
          <div class="empty-icon">🎯</div>
          <h3>おすすめがありません</h3>
          <p>より多くのデータを追加すると、パーソナライズされたおすすめが表示されます</p>
          <button class="btn btn-primary" onclick="window.location.href='input.html'">
            データを追加する
          </button>
        </div>
      `;
    } catch (error) {
      console.error('空のおすすめ状態の表示に失敗しました:', error);
    }
  }

  /**
   * おすすめアイテムの詳細を表示
   * @param {string} itemId - アイテムID
   */
  showRecommendationDetails(itemId) {
    try {
      // データマネージャーからおすすめアイテムを取得
      const recommendations = this.app.dataManager.generateRecommendations(3);
      const item = recommendations.find(rec => rec.id === itemId);
      
      if (!item) {
        console.warn('おすすめアイテムが見つかりません:', itemId);
        return;
      }

      const details = `
        <div class="recommendation-details">
          <h3>${this.escapeHtml(item.name)}</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ブランド:</label>
              <span>${this.escapeHtml(item.brand)}</span>
            </div>
            <div class="detail-item">
              <label>価格:</label>
              <span>${this.escapeHtml(item.price)}</span>
            </div>
            <div class="detail-item">
              <label>カテゴリ:</label>
              <span>${this.escapeHtml(item.categoryDisplay)}</span>
            </div>
            <div class="detail-item">
              <label>色:</label>
              <span>${this.escapeHtml(item.colorName)}</span>
            </div>
            <div class="detail-item">
              <label>マッチ度:</label>
              <span>${item.matchScore}%</span>
            </div>
            <div class="detail-item">
              <label>価格帯:</label>
              <span>${this.escapeHtml(item.priceRange)}</span>
            </div>
          </div>
          <div class="preferences-analysis">
            <h4>あなたの好み分析</h4>
            <div class="preferences-grid">
              <div class="preference-item">
                <label>色相:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.colorHue / 3.6}%"></div>
                  </div>
                  <span>${item.preferences.colorHue}</span>
                </div>
              </div>
              <div class="preference-item">
                <label>価格:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.price}%"></div>
                  </div>
                  <span>${item.preferences.price}</span>
                </div>
              </div>
              <div class="preference-item">
                <label>シルエット:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.silhouetteValue}%"></div>
                  </div>
                  <span>${item.preferences.silhouetteValue}</span>
                </div>
              </div>
              <div class="preference-item">
                <label>素材感:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.materialValue}%"></div>
                  </div>
                  <span>${item.preferences.materialValue}</span>
                </div>
              </div>
              <div class="preference-item">
                <label>感情:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.emotion}%"></div>
                  </div>
                  <span>${item.preferences.emotion}</span>
                </div>
              </div>
              <div class="preference-item">
                <label>フィット感:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.fitValue}%"></div>
                  </div>
                  <span>${item.preferences.fitValue}</span>
                </div>
              </div>
              <div class="preference-item">
                <label>価値観:</label>
                <div class="slider-value-display">
                  <div class="slider-bar">
                    <div class="slider-fill" style="width: ${item.preferences.values}%"></div>
                  </div>
                  <span>${item.preferences.values}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="recommendation-description">
            <p>${this.escapeHtml(item.description)}</p>
          </div>
        </div>
      `;
      
      this.app.showModal('おすすめ詳細', details);

    } catch (error) {
      console.error('おすすめアイテムの詳細表示に失敗しました:', error);
    }
  }

  /**
   * 要素のアニメーション
   * @param {HTMLElement} element - アニメーションする要素
   * @param {string} animation - アニメーション名
   */
  animateElement(element, animation = 'fadeIn') {
    try {
      element.classList.add(`animate-${animation}`);
      element.addEventListener('animationend', () => {
        element.classList.remove(`animate-${animation}`);
      }, { once: true });
    } catch (error) {
      console.error('アニメーションの実行に失敗しました:', error);
    }
  }

  /**
   * 要素のフェードアウト
   * @param {HTMLElement} element - フェードアウトする要素
   * @param {Function} callback - コールバック関数
   */
  fadeOutElement(element, callback) {
    try {
      element.style.transition = 'opacity 0.3s ease-out';
      element.style.opacity = '0';
      
      setTimeout(() => {
        if (callback) callback();
      }, 300);
    } catch (error) {
      console.error('フェードアウトに失敗しました:', error);
      if (callback) callback();
    }
  }

  /**
   * ツールチップの表示
   * @param {HTMLElement} target - ターゲット要素
   * @param {string} content - ツールチップの内容
   */
  showTooltip(target, content) {
    try {
      // 既存のツールチップを削除
      const existingTooltip = document.querySelector('.tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }

      // 新しいツールチップを作成
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = content;
      document.body.appendChild(tooltip);

      // 位置を計算
      const rect = target.getBoundingClientRect();
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

      // 3秒後に自動削除
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.remove();
        }
      }, 3000);

    } catch (error) {
      console.error('ツールチップの表示に失敗しました:', error);
    }
  }

  /**
   * 確認ダイアログの表示
   * @param {string} message - メッセージ
   * @param {Function} onConfirm - 確認時のコールバック
   * @param {Function} onCancel - キャンセル時のコールバック
   */
  showConfirmDialog(message, onConfirm, onCancel) {
    try {
      this.app.showModal('確認', message, onConfirm, onCancel);
    } catch (error) {
      console.error('確認ダイアログの表示に失敗しました:', error);
    }
  }
}

// グローバルインスタンスを作成
window.UIManager = UIManager; 