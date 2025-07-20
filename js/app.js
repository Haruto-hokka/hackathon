/**
 * 服管理アプリ - メインアプリケーションファイル
 * 
 * 機能:
 * - アプリケーションの初期化
 * - タブ管理
 * - グローバルイベントハンドリング
 * - エラーハンドリング
 * - ユーティリティ関数
 */

// メインアプリケーションクラス
class ClothingApp {
  constructor() {
    this.dataManager = null;
    this.uiManager = null;
    this.chartManager = null;
    this.currentTab = 'list';
    this.sections = {
      list: { collapsed: false },
      results: { collapsed: false },
      recommend: { collapsed: false }
    };
  }

  /**
   * アプリケーションの初期化
   */
  initialize() {
    console.log('服管理アプリを初期化中...');
    
    try {
      // データマネージャーの初期化
      this.initializeDataManager();
      
      // UIマネージャーの初期化
      this.initializeUIManager();
      
      // チャートマネージャーの初期化
      this.initializeChartManager();
      
      // ナビゲーション機能の初期化
      this.initializeNavigation();
      
      // セクションの展開/折りたたみ機能の初期化
      this.initializeSectionToggles();
      
      // 初期UIの更新
      this.refreshUI();
      
      console.log('アプリケーションの初期化が完了しました');
      
    } catch (error) {
      console.error('アプリケーションの初期化に失敗しました:', error);
      this.showErrorState('アプリケーションの初期化に失敗しました');
    }
  }

  /**
   * データマネージャーの初期化
   */
  initializeDataManager() {
    if (window.DataManager) {
      this.dataManager = window.DataManager;
      console.log('データマネージャーを初期化しました');
      
      // データマネージャーの状態を確認
      const items = this.dataManager.getAllClothingItems();
      console.log(`データマネージャーに${items.length}件のアイテムがあります`);
      
    } else {
      console.warn('データマネージャーが見つかりません');
    }
  }

  /**
   * UIマネージャーの初期化
   */
  initializeUIManager() {
    if (window.UIManager) {
      this.uiManager = new window.UIManager(this);
      console.log('UIマネージャーを初期化しました');
    } else {
      console.warn('UIマネージャーが見つかりません');
    }
  }

  /**
   * チャートマネージャーの初期化
   */
  initializeChartManager() {
    if (window.ChartManager) {
      this.chartManager = new window.ChartManager(this);
      console.log('チャートマネージャーを初期化しました');
    } else {
      console.warn('チャートマネージャーが見つかりません');
    }
  }

  /**
   * ナビゲーション機能の初期化
   */
  initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetTab = link.getAttribute('data-tab');
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });
    
    // 初期タブを設定
    this.switchTab('list');
  }

  /**
   * おすすめタブの初期化
   */
  initializeRecommendTab() {
    console.log('おすすめタブを初期化中...');
    
    if (this.dataManager && this.uiManager) {
      // おすすめアイテムを生成
      const recommendations = this.dataManager.generateRecommendations(3);
      
      // UIを更新
      this.uiManager.updateRecommendations(recommendations);
      
      console.log('おすすめタブの初期化が完了しました');
    } else {
      console.warn('データマネージャーまたはUIマネージャーが利用できません');
    }
  }

  /**
   * 結果データタブの初期化
   */
  initializeResultsTab() {
    console.log('結果データタブを初期化中...');
    
    if (this.chartManager) {
      this.chartManager.initializeCharts();
    } else {
      console.warn('チャートマネージャーが利用できません');
    }
  }

  /**
   * 一覧タブの初期化
   */
  initializeListTab() {
    console.log('一覧タブを初期化中...');
    this.refreshDataTable();
  }

  /**
   * タブコンテンツの初期化
   * @param {string} tabName - タブ名
   */
  initializeTabContent(tabName) {
    switch (tabName) {
      case 'list':
        this.initializeListTab();
        break;
      case 'results':
        this.initializeResultsTab();
        break;
      case 'recommend':
        this.initializeRecommendTab();
        break;
    }
  }

  /**
   * タブの切り替え
   * @param {string} tabName - 切り替えるタブ名
   */
  switchTab(tabName) {
    console.log(`タブを切り替え中: ${tabName}`);
    
    // すべてのタブコンテンツを非表示
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // すべてのナビゲーションリンクからアクティブクラスを削除
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // 指定されたタブをアクティブにする
    const targetTab = document.getElementById(`${tabName}-tab`);
    const targetLink = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (targetTab) {
      targetTab.classList.add('active');
    }
    
    if (targetLink) {
      targetLink.classList.add('active');
    }
    
    // アプリケーション状態を更新
    this.currentTab = tabName;
    this.saveAppState();
    
    // タブ固有の初期化処理
    this.initializeTabContent(tabName);
  }

  /**
   * セクションの展開/折りたたみ機能の初期化
   */
  initializeSectionToggles() {
    const sectionHeaders = document.querySelectorAll('.section-header, .subsection-header');
    
    sectionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const toggleTarget = header.getAttribute('data-toggle');
        if (toggleTarget) {
          this.toggleSection(toggleTarget);
        }
      });
    });
  }

  /**
   * セクションの展開/折りたたみ
   * @param {string} sectionId - セクションID
   */
  toggleSection(sectionId) {
    const sectionContent = document.getElementById(sectionId);
    const sectionHeader = document.querySelector(`[data-toggle="${sectionId}"]`);
    
    if (sectionContent && sectionHeader) {
      const isCollapsed = sectionContent.classList.contains('collapsed');
      
      if (isCollapsed) {
        // 展開
        sectionContent.classList.remove('collapsed');
        sectionHeader.classList.remove('collapsed');
      } else {
        // 折りたたみ
        sectionContent.classList.add('collapsed');
        sectionHeader.classList.add('collapsed');
      }
      
      // アプリケーション状態を更新
      this.updateSectionState(sectionId, !isCollapsed);
    }
  }

  /**
   * セクション状態の更新
   * @param {string} sectionId - セクションID
   * @param {boolean} isExpanded - 展開状態
   */
  updateSectionState(sectionId, isExpanded) {
    const tabName = this.getTabNameFromSectionId(sectionId);
    
    if (tabName && this.sections[tabName]) {
      this.sections[tabName].collapsed = !isExpanded;
      this.saveAppState();
    }
  }

  /**
   * セクションIDからタブ名を取得
   * @param {string} sectionId - セクションID
   * @returns {string} タブ名
   */
  getTabNameFromSectionId(sectionId) {
    const sectionMap = {
      'list-section': 'list',
      'results-section': 'results',
      'recommend-section': 'recommend'
    };
    
    return sectionMap[sectionId] || null;
  }

  /**
   * データテーブルの更新
   */
  refreshDataTable() {
    console.log('データテーブルを更新中...');
    
    if (this.dataManager && this.uiManager) {
      const items = this.dataManager.getAllClothingItems();
      console.log(`テーブルに${items.length}件のアイテムを表示します`);
      this.uiManager.updateTable(items);
    } else {
      console.warn('データマネージャーまたはUIマネージャーが利用できません');
    }
  }

  /**
   * UI全体の更新
   */
  refreshUI() {
    console.log('UI全体を更新中...');
    
    // 一覧テーブルの更新
    this.refreshDataTable();
    
    // 統計情報の更新
    if (this.dataManager && this.uiManager) {
      const statistics = this.dataManager.data.statistics;
      this.uiManager.updateStatistics(statistics);
    }
    
    // 現在のタブに応じて追加の更新
    switch (this.currentTab) {
      case 'results':
        if (this.chartManager) {
          const data = this.dataManager.getData();
          this.chartManager.updateAllCharts(data);
        }
        break;
      case 'recommend':
        if (this.dataManager && this.uiManager) {
          const recommendations = this.dataManager.generateRecommendations(3);
          this.uiManager.updateRecommendations(recommendations);
        }
        break;
    }
  }

  /**
   * アプリケーション状態の保存
   */
  saveAppState() {
    try {
      const appState = {
        currentTab: this.currentTab,
        sections: this.sections
      };
      localStorage.setItem('clothingAppState', JSON.stringify(appState));
    } catch (error) {
      console.error('アプリケーション状態の保存に失敗しました:', error);
    }
  }

  /**
   * アプリケーション状態の読み込み
   */
  loadAppState() {
    try {
      const savedState = localStorage.getItem('clothingAppState');
      if (savedState) {
        const appState = JSON.parse(savedState);
        this.currentTab = appState.currentTab || 'list';
        this.sections = appState.sections || this.sections;
      }
    } catch (error) {
      console.error('アプリケーション状態の読み込みに失敗しました:', error);
    }
  }

  /**
   * モーダルの表示
   * @param {string} title - タイトル
   * @param {string} message - メッセージ
   * @param {Function} onConfirm - 確認時のコールバック
   * @param {Function} onCancel - キャンセル時のコールバック
   */
  showModal(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalConfirm = document.getElementById('modalConfirm');
    const modalCancel = document.getElementById('modalCancel');
    const modalClose = document.getElementById('modalClose');
    
    if (modal && modalTitle && modalMessage) {
      modalTitle.textContent = title;
      modalMessage.innerHTML = message;
      modal.style.display = 'flex';
      
      // イベントリスナーの設定
      const closeModal = () => {
        modal.style.display = 'none';
      };
      
      const handleConfirm = () => {
        closeModal();
        if (onConfirm) onConfirm();
      };
      
      const handleCancel = () => {
        closeModal();
        if (onCancel) onCancel();
      };
      
      // 既存のイベントリスナーを削除
      modalConfirm.removeEventListener('click', handleConfirm);
      modalCancel.removeEventListener('click', handleCancel);
      modalClose.removeEventListener('click', closeModal);
      
      // 新しいイベントリスナーを追加
      modalConfirm.addEventListener('click', handleConfirm);
      modalCancel.addEventListener('click', handleCancel);
      modalClose.addEventListener('click', closeModal);
      
      // 背景クリックでキャンセル
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          handleCancel();
        }
      });
    }
  }

  /**
   * 通知の表示
   * @param {string} message - メッセージ
   * @param {string} type - 通知タイプ
   */
  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationClose = document.getElementById('notificationClose');
    
    if (notification && notificationMessage) {
      notificationMessage.textContent = message;
      notification.className = `notification notification-${type}`;
      notification.style.display = 'flex';
      
      // 自動非表示（5秒後）
      setTimeout(() => {
        this.hideNotification();
      }, 5000);
      
      // 閉じるボタンのイベントリスナー
      if (notificationClose) {
        notificationClose.addEventListener('click', () => {
          this.hideNotification();
        });
      }
    }
  }

  /**
   * 通知の非表示
   */
  hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.style.display = 'none';
    }
  }

  /**
   * エラー状態の表示
   * @param {string} message - エラーメッセージ
   */
  showErrorState(message) {
    if (this.uiManager) {
      this.uiManager.showErrorState(message);
    } else {
      console.error('エラー:', message);
    }
  }

  /**
   * 値のフォーマット
   * @param {*} value - フォーマットする値
   * @param {string} type - フォーマットタイプ
   * @returns {string} フォーマットされた値
   */
  formatValue(value, type) {
    switch (type) {
      case 'currency':
        return `¥${value || 0}`;
      case 'percentage':
        return `${value || 0}%`;
      case 'date':
        return new Date(value).toLocaleDateString('ja-JP');
      default:
        return value || '';
    }
  }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM読み込み完了、アプリケーションを初期化中...');
  
  // グローバルアプリケーションインスタンスを作成
  window.app = new ClothingApp();
  
  // アプリケーションを初期化
  window.app.initialize();
  
  // 初期化完了後の確認
  setTimeout(() => {
    if (window.app && window.app.dataManager) {
      const items = window.app.dataManager.getAllClothingItems();
      console.log(`初期化完了: ${items.length}件のアイテムが登録されています`);
    }
  }, 1000);
});

// グローバル関数として公開
window.ClothingApp = ClothingApp; 