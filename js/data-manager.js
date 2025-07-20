/**
 * データ管理クラス
 * 
 * 機能:
 * - 服データのCRUD操作
 * - localStorageを使用したデータ永続化
 * - 統計情報の計算
 * - データの検証とバリデーション
 * - 入力ページデータの統合
 */

class DataManager {
  constructor() {
    this.storageKey = 'clothingAppData';
    this.inputStorageKey = 'clothingData'; // 入力ページ用のストレージキー
    this.data = this.loadData();
    this.validateData();
    // 初期化時にデータ統合を実行
    this.mergeInputData();
  }

  /**
   * ローカルストレージからデータを読み込み
   * @returns {Object} 保存されたデータまたは初期データ
   */
  loadData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return this.migrateDataIfNeeded(parsedData);
      }
      return this.getInitialData();
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
      return this.getInitialData();
    }
  }

  /**
   * 初期データ構造を取得
   * @returns {Object} 初期データ
   */
  getInitialData() {
    return {
      version: '1.1.0',
      clothingItems: [],
      statistics: {
        totalItems: 0,
        averagePreference: 0,
        favoriteCategory: null,
        totalInvestment: 0,
        categoryDistribution: {},
        priceRange: { min: 0, max: 0, average: 0 }
      },
      settings: {
        theme: 'light',
        language: 'ja',
        currency: 'JPY'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.1.0'
      }
    };
  }

  /**
   * 入力ページのデータを統合
   */
  mergeInputData() {
    try {
      console.log('入力ページデータの統合を開始...');
      const inputData = localStorage.getItem(this.inputStorageKey);
      
      if (inputData) {
        console.log('入力ページデータを発見:', inputData);
        const parsedInputData = JSON.parse(inputData);
        
        if (Array.isArray(parsedInputData)) {
          console.log(`${parsedInputData.length}件のデータを統合します`);
          
          parsedInputData.forEach((inputItem, index) => {
            console.log(`データ${index + 1}を処理中:`, inputItem);
            
            // 入力ページのデータを既存のデータ構造に変換
            const convertedItem = this.convertInputDataToClothingItem(inputItem);
            
            // 重複チェック（同じ商品名とタイムスタンプで判定）
            const isDuplicate = this.data.clothingItems.some(item => 
              item.name === convertedItem.name && 
              item.createdAt === convertedItem.createdAt
            );
            
            if (!isDuplicate) {
              this.data.clothingItems.push(convertedItem);
              console.log('新しいアイテムを追加:', convertedItem.name);
            } else {
              console.log('重複データをスキップ:', convertedItem.name);
            }
          });
          
          // 統計情報を更新
          this.updateStatistics();
          
          // 統合後のデータを保存
          this.saveData();
          
          // 入力ページのデータをクリア（統合完了後）
          localStorage.removeItem(this.inputStorageKey);
          
          console.log('入力ページのデータを統合しました');
        } else {
          console.log('入力ページデータが配列ではありません:', typeof parsedInputData);
        }
      } else {
        console.log('入力ページデータが見つかりません');
      }
    } catch (error) {
      console.error('入力ページデータの統合に失敗しました:', error);
    }
  }

  /**
   * 入力ページのデータを服アイテムに変換
   * @param {Object} inputData - 入力ページのデータ
   * @returns {Object} 変換された服アイテム
   */
  convertInputDataToClothingItem(inputData) {
    const tableData = inputData.tableData || {};
    const sliderData = inputData.sliderData || {};
    
    const convertedItem = {
      id: this.generateId(),
      name: tableData['商品名'] || '未命名アイテム',
      color: tableData['配色'] || '',
      silhouette: tableData['シルエット'] || '',
      material: tableData['素材感'] || '',
      brand: tableData['ブランド/値段'] || '',
      fit: tableData['フィット感'] || '',
      category: tableData['カテゴリ'] || '',
      usageScene: tableData['使用シーン'] || '',
      personalValues: tableData['個人的な価値観・こだわり'] || '',
      purchaseInfo: tableData['購入日/URL'] || '',
      
      // スライダーデータ
      colorHue: sliderData.colorSlider || 0,
      price: sliderData.priceSlider || 50,
      silhouetteValue: sliderData.silhouetteSlider || 50,
      materialValue: sliderData.materialSlider || 50,
      emotion: sliderData.emotionSlider || 50,
      fitValue: sliderData.fitSlider || 50,
      values: sliderData.valuesSlider || 50,
      
      // メタデータ
      createdAt: inputData.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // 評価データ（将来的な拡張用）
      preferences: {
        color: sliderData.colorSlider || 0,
        price: sliderData.priceSlider || 50,
        silhouette: sliderData.silhouetteSlider || 50,
        material: sliderData.materialSlider || 50,
        emotion: sliderData.emotionSlider || 50,
        fit: sliderData.fitSlider || 50,
        values: sliderData.valuesSlider || 50,
        overall: this.calculateOverallPreference(sliderData)
      }
    };
    
    console.log('変換されたアイテム:', convertedItem);
    return convertedItem;
  }

  /**
   * 総合評価を計算
   * @param {Object} sliderData - スライダーデータ
   * @returns {number} 総合評価（0-100）
   */
  calculateOverallPreference(sliderData) {
    const values = [
      sliderData.colorSlider || 0,
      sliderData.priceSlider || 50,
      sliderData.silhouetteSlider || 50,
      sliderData.materialSlider || 50,
      sliderData.emotionSlider || 50,
      sliderData.fitSlider || 50,
      sliderData.valuesSlider || 50
    ];
    
    // 平均値を計算
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    
    // 0-100の範囲に正規化
    return Math.round(Math.max(0, Math.min(100, average)));
  }

  /**
   * データのマイグレーション（将来的な拡張用）
   * @param {Object} data - 既存のデータ
   * @returns {Object} マイグレーション後のデータ
   */
  migrateDataIfNeeded(data) {
    const currentVersion = '1.1.0';
    
    if (!data.version || data.version !== currentVersion) {
      console.log(`データのマイグレーションを実行中: ${data.version || 'unknown'} -> ${currentVersion}`);
      
      // バージョン1.0.0から1.1.0へのマイグレーション
      if (!data.statistics) {
        data.statistics = this.getInitialData().statistics;
      }
      
      if (!data.settings) {
        data.settings = this.getInitialData().settings;
      }
      
      if (!data.metadata) {
        data.metadata = this.getInitialData().metadata;
      }
      
      // 既存のアイテムに新しいフィールドを追加
      if (data.clothingItems && Array.isArray(data.clothingItems)) {
        data.clothingItems.forEach(item => {
          if (!item.preferences) {
            item.preferences = {
              color: item.colorHue || 0,
              price: item.price || 50,
              silhouette: item.silhouetteValue || 50,
              material: item.materialValue || 50,
              emotion: item.emotion || 50,
              fit: item.fitValue || 50,
              values: item.values || 50,
              overall: item.overallPreference || 50
            };
          }
        });
      }
      
      data.version = currentVersion;
      data.metadata.lastUpdated = new Date().toISOString();
    }
    
    return data;
  }

  /**
   * データの検証
   */
  validateData() {
    if (!this.data.clothingItems || !Array.isArray(this.data.clothingItems)) {
      this.data.clothingItems = [];
    }
    
    if (!this.data.statistics) {
      this.data.statistics = this.getInitialData().statistics;
    }
    
    if (!this.data.settings) {
      this.data.settings = this.getInitialData().settings;
    }
    
    if (!this.data.metadata) {
      this.data.metadata = this.getInitialData().metadata;
    }
  }

  /**
   * データをローカルストレージに保存
   */
  saveData() {
    try {
      this.data.metadata.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('データを保存しました:', this.data);
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
      throw new Error('データの保存に失敗しました。ブラウザの設定を確認してください。');
    }
  }

  /**
   * 服アイテムを追加
   * @param {Object} itemData - 服のデータ
   * @returns {Object} 追加されたアイテム
   */
  addClothingItem(itemData) {
    try {
      // データの検証
      const validatedData = this.validateClothingItem(itemData);
      
      // 新しいアイテムを作成
      const newItem = {
        id: this.generateId(),
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // データに追加
      this.data.clothingItems.push(newItem);
      
      // 統計情報を更新
      this.updateStatistics();
      
      // データを保存
      this.saveData();
      
      console.log('服アイテムを追加しました:', newItem);
      return newItem;
      
    } catch (error) {
      console.error('服アイテムの追加に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 入力ページから直接データを追加
   * @param {Object} inputData - 入力ページのデータ
   * @returns {Object} 追加されたアイテム
   */
  addFromInputPage(inputData) {
    try {
      console.log('入力ページからデータを追加中:', inputData);
      const convertedItem = this.convertInputDataToClothingItem(inputData);
      
      // データに追加
      this.data.clothingItems.push(convertedItem);
      
      // 統計情報を更新
      this.updateStatistics();
      
      // データを保存
      this.saveData();
      
      console.log('入力ページからデータを追加しました:', convertedItem);
      return convertedItem;
      
    } catch (error) {
      console.error('入力ページからのデータ追加に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 服アイテムを更新
   * @param {string} id - アイテムID
   * @param {Object} updateData - 更新データ
   * @returns {Object} 更新されたアイテム
   */
  updateClothingItem(id, updateData) {
    try {
      const index = this.data.clothingItems.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`ID ${id} のアイテムが見つかりません`);
      }
      
      // データの検証
      const validatedData = this.validateClothingItem(updateData, true);
      
      // アイテムを更新
      this.data.clothingItems[index] = {
        ...this.data.clothingItems[index],
        ...validatedData,
        updatedAt: new Date().toISOString()
      };
      
      // 統計情報を更新
      this.updateStatistics();
      
      // データを保存
      this.saveData();
      
      console.log('服アイテムを更新しました:', this.data.clothingItems[index]);
      return this.data.clothingItems[index];
      
    } catch (error) {
      console.error('服アイテムの更新に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 服アイテムを削除
   * @param {string} id - アイテムID
   * @returns {boolean} 削除成功フラグ
   */
  deleteClothingItem(id) {
    try {
      const index = this.data.clothingItems.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`ID ${id} のアイテムが見つかりません`);
      }
      
      const deletedItem = this.data.clothingItems.splice(index, 1)[0];
      
      // 統計情報を更新
      this.updateStatistics();
      
      // データを保存
      this.saveData();
      
      console.log('服アイテムを削除しました:', deletedItem);
      return true;
      
    } catch (error) {
      console.error('服アイテムの削除に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 指定されたIDの服アイテムを取得
   * @param {string} id - アイテムID
   * @returns {Object|null} 服アイテムまたはnull
   */
  getClothingItem(id) {
    return this.data.clothingItems.find(item => item.id === id) || null;
  }

  /**
   * すべての服アイテムを取得
   * @returns {Array} 服アイテムの配列
   */
  getAllClothingItems() {
    console.log('全アイテムを取得:', this.data.clothingItems);
    return [...this.data.clothingItems];
  }

  /**
   * 全データを取得
   * @returns {Object} 全データ
   */
  getData() {
    return {
      ...this.data,
      clothingItems: [...this.data.clothingItems]
    };
  }

  /**
   * 統計情報を更新
   */
  updateStatistics() {
    const items = this.data.clothingItems;
    
    if (items.length === 0) {
      this.data.statistics = {
        totalItems: 0,
        averagePreference: 0,
        favoriteCategory: null,
        totalInvestment: 0,
        categoryDistribution: {},
        priceRange: { min: 0, max: 0, average: 0 }
      };
      return;
    }
    
    // 総アイテム数
    this.data.statistics.totalItems = items.length;
    
    // 平均好み度
    const preferences = items.map(item => item.preferences?.overall || 50);
    this.data.statistics.averagePreference = Math.round(
      preferences.reduce((sum, pref) => sum + pref, 0) / preferences.length
    );
    
    // お気に入りカテゴリ
    const categories = items.map(item => item.category).filter(Boolean);
    if (categories.length > 0) {
      const categoryCount = {};
      categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      this.data.statistics.favoriteCategory = Object.keys(categoryCount).reduce(
        (a, b) => categoryCount[a] > categoryCount[b] ? a : b
      );
    }
    
    // カテゴリ分布
    this.data.statistics.categoryDistribution = {};
    categories.forEach(category => {
      this.data.statistics.categoryDistribution[category] = 
        (this.data.statistics.categoryDistribution[category] || 0) + 1;
    });
    
    // 価格範囲（スライダー値ベース）
    const prices = items.map(item => item.price || 50);
    this.data.statistics.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
    };
    
    console.log('統計情報を更新しました:', this.data.statistics);
  }

  /**
   * 服アイテムのデータ検証
   * @param {Object} itemData - 検証するデータ
   * @param {boolean} isUpdate - 更新モードかどうか
   * @returns {Object} 検証済みデータ
   */
  validateClothingItem(itemData, isUpdate = false) {
    const errors = [];
    
    // 必須フィールドのチェック
    if (!isUpdate && (!itemData.name || itemData.name.trim() === '')) {
      errors.push('商品名は必須です');
    }
    
    // 文字列フィールドの長さチェック
    const stringFields = ['name', 'color', 'silhouette', 'material', 'brand', 'fit', 'category'];
    stringFields.forEach(field => {
      if (itemData[field] && itemData[field].length > 100) {
        errors.push(`${field}は100文字以内で入力してください`);
      }
    });
    
    // 数値フィールドの範囲チェック
    const numericFields = ['colorHue', 'price', 'silhouetteValue', 'materialValue', 'emotion', 'fitValue', 'values'];
    numericFields.forEach(field => {
      if (itemData[field] !== undefined) {
        const value = Number(itemData[field]);
        if (isNaN(value) || value < 0 || value > 100) {
          errors.push(`${field}は0-100の範囲で入力してください`);
        }
      }
    });
    
    if (errors.length > 0) {
      throw new Error(`データ検証エラー: ${errors.join(', ')}`);
    }
    
    // デフォルト値の設定
    return {
      name: itemData.name || '',
      color: itemData.color || '',
      silhouette: itemData.silhouette || '',
      material: itemData.material || '',
      brand: itemData.brand || '',
      fit: itemData.fit || '',
      category: itemData.category || '',
      usageScene: itemData.usageScene || '',
      personalValues: itemData.personalValues || '',
      purchaseInfo: itemData.purchaseInfo || '',
      colorHue: itemData.colorHue || 0,
      price: itemData.price || 50,
      silhouetteValue: itemData.silhouetteValue || 50,
      materialValue: itemData.materialValue || 50,
      emotion: itemData.emotion || 50,
      fitValue: itemData.fitValue || 50,
      values: itemData.values || 50,
      preferences: itemData.preferences || {
        color: itemData.colorHue || 0,
        price: itemData.price || 50,
        silhouette: itemData.silhouetteValue || 50,
        material: itemData.materialValue || 50,
        emotion: itemData.emotion || 50,
        fit: itemData.fitValue || 50,
        values: itemData.values || 50,
        overall: itemData.preferences?.overall || 50
      }
    };
  }

  /**
   * ユニークIDを生成
   * @returns {string} ユニークID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * すべてのデータをクリア
   */
  clearAllData() {
    try {
      this.data = this.getInitialData();
      this.saveData();
      console.log('すべてのデータをクリアしました');
    } catch (error) {
      console.error('データのクリアに失敗しました:', error);
      throw error;
    }
  }

  /**
   * データのバックアップを作成
   * @returns {Object} バックアップデータ
   */
  createBackup() {
    try {
      const backup = {
        data: this.getData(),
        timestamp: new Date().toISOString(),
        version: this.data.version
      };
      
      const backupString = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `clothing-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('バックアップを作成しました');
      return backup;
      
    } catch (error) {
      console.error('バックアップの作成に失敗しました:', error);
      throw error;
    }
  }

  /**
   * バックアップから復元
   * @param {Object} backupData - バックアップデータ
   */
  restoreFromBackup(backupData) {
    try {
      if (!backupData.data || !backupData.version) {
        throw new Error('無効なバックアップデータです');
      }
      
      this.data = this.migrateDataIfNeeded(backupData.data);
      this.validateData();
      this.saveData();
      
      console.log('バックアップから復元しました');
      
    } catch (error) {
      console.error('バックアップからの復元に失敗しました:', error);
      throw error;
    }
  }

  /**
   * アイテムを検索
   * @param {string} query - 検索クエリ
   * @param {Object} filters - フィルター条件
   * @returns {Array} 検索結果
   */
  searchItems(query, filters = {}) {
    let results = [...this.data.clothingItems];
    
    // テキスト検索
    if (query && query.trim() !== '') {
      const searchTerm = query.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.color.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // フィルター適用
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }
    
    if (filters.minPrice !== undefined) {
      results = results.filter(item => (item.price || 0) >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      results = results.filter(item => (item.price || 0) <= filters.maxPrice);
    }
    
    if (filters.minPreference !== undefined) {
      results = results.filter(item => (item.preferences?.overall || 0) >= filters.minPreference);
    }
    
    return results;
  }

  /**
   * アイテムをソート
   * @param {Array} items - ソートするアイテム配列
   * @param {string} sortBy - ソート基準
   * @param {string} sortOrder - ソート順序
   * @returns {Array} ソートされた配列
   */
  sortItems(items, sortBy = 'createdAt', sortOrder = 'desc') {
    return [...items].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // 日付の場合はDateオブジェクトに変換
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // 数値の場合は数値として比較
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // 文字列の場合は文字列として比較
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // 日付の場合は日付として比較
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }

  /**
   * おすすめアイテムを生成
   * @param {number} count - 生成するアイテム数
   * @returns {Array} おすすめアイテムの配列
   */
  generateRecommendations(count = 3) {
    try {
      console.log(`${count}件のおすすめアイテムを生成中...`);
      
      if (!this.data.clothingItems || this.data.clothingItems.length === 0) {
        console.log('データがないため、デフォルトのおすすめを生成します');
        return this.generateDefaultRecommendations(count);
      }

      // ユーザーの好みを分析
      const userPreferences = this.analyzeUserPreferences();
      console.log('ユーザーの好み分析:', userPreferences);

      // おすすめアイテムを生成
      const recommendations = [];
      
      for (let i = 0; i < count; i++) {
        const recommendation = this.createRecommendationItem(userPreferences, i);
        recommendations.push(recommendation);
      }

      console.log('おすすめアイテムを生成しました:', recommendations);
      return recommendations;

    } catch (error) {
      console.error('おすすめアイテムの生成に失敗しました:', error);
      return this.generateDefaultRecommendations(count);
    }
  }

  /**
   * ユーザーの好みを分析
   * @returns {Object} 好み分析結果
   */
  analyzeUserPreferences() {
    try {
      const items = this.data.clothingItems;
      if (!items || items.length === 0) {
        return this.getDefaultPreferences();
      }

      // 各項目の平均値を計算
      const preferences = {
        colorHue: 0,
        price: 0,
        silhouetteValue: 0,
        materialValue: 0,
        emotion: 0,
        fitValue: 0,
        values: 0,
        category: {}
      };

      let validCount = 0;

      items.forEach(item => {
        if (item.colorHue !== undefined) preferences.colorHue += item.colorHue;
        if (item.price !== undefined) preferences.price += item.price;
        if (item.silhouetteValue !== undefined) preferences.silhouetteValue += item.silhouetteValue;
        if (item.materialValue !== undefined) preferences.materialValue += item.materialValue;
        if (item.emotion !== undefined) preferences.emotion += item.emotion;
        if (item.fitValue !== undefined) preferences.fitValue += item.fitValue;
        if (item.values !== undefined) preferences.values += item.values;

        // カテゴリの集計
        const category = item.category || 'other';
        preferences.category[category] = (preferences.category[category] || 0) + 1;

        validCount++;
      });

      // 平均を計算
      if (validCount > 0) {
        preferences.colorHue = Math.round(preferences.colorHue / validCount);
        preferences.price = Math.round(preferences.price / validCount);
        preferences.silhouetteValue = Math.round(preferences.silhouetteValue / validCount);
        preferences.materialValue = Math.round(preferences.materialValue / validCount);
        preferences.emotion = Math.round(preferences.emotion / validCount);
        preferences.fitValue = Math.round(preferences.fitValue / validCount);
        preferences.values = Math.round(preferences.values / validCount);
      }

      // お気に入りカテゴリを決定
      preferences.favoriteCategory = Object.keys(preferences.category).reduce(
        (a, b) => preferences.category[a] > preferences.category[b] ? a : b
      );

      return preferences;

    } catch (error) {
      console.error('ユーザーの好み分析に失敗しました:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * デフォルトの好み設定を取得
   * @returns {Object} デフォルト設定
   */
  getDefaultPreferences() {
    return {
      colorHue: 180,
      price: 50,
      silhouetteValue: 50,
      materialValue: 50,
      emotion: 50,
      fitValue: 50,
      values: 50,
      favoriteCategory: 'tops',
      category: { 'tops': 1 }
    };
  }

  /**
   * おすすめアイテムを作成
   * @param {Object} preferences - ユーザーの好み
   * @param {number} index - アイテムのインデックス
   * @returns {Object} おすすめアイテム
   */
  createRecommendationItem(preferences, index) {
    try {
      // カテゴリ別の商品名とブランド
      const categoryItems = {
        'tops': [
          { name: 'ベーシックTシャツ', brand: 'UNIQLO', price: '¥1,500' },
          { name: 'カジュアルシャツ', brand: 'GU', price: '¥2,500' },
          { name: 'ニットセーター', brand: 'ZARA', price: '¥4,500' }
        ],
        'bottoms': [
          { name: 'デニムパンツ', brand: 'UNIQLO', price: '¥3,900' },
          { name: 'チノパンツ', brand: 'GU', price: '¥2,900' },
          { name: 'スカート', brand: 'ZARA', price: '¥5,900' }
        ],
        'outerwear': [
          { name: 'デニムジャケット', brand: 'UNIQLO', price: '¥4,900' },
          { name: 'カーディガン', brand: 'GU', price: '¥3,500' },
          { name: 'トレンチコート', brand: 'ZARA', price: '¥12,900' }
        ],
        'shoes': [
          { name: 'スニーカー', brand: 'CONVERSE', price: '¥8,500' },
          { name: 'ローファー', brand: 'UNIQLO', price: '¥3,900' },
          { name: 'ブーツ', brand: 'ZARA', price: '¥9,900' }
        ],
        'accessories': [
          { name: 'トートバッグ', brand: 'UNIQLO', price: '¥1,500' },
          { name: 'ベルト', brand: 'GU', price: '¥1,900' },
          { name: '帽子', brand: 'ZARA', price: '¥2,900' }
        ]
      };

      const category = preferences.favoriteCategory || 'tops';
      const items = categoryItems[category] || categoryItems['tops'];
      const selectedItem = items[index % items.length];

      // ユーザーの好みに基づいて価格を調整
      const basePrice = parseInt(selectedItem.price.replace(/[^\d]/g, ''));
      const adjustedPrice = Math.round(basePrice * (preferences.price / 50));
      const priceRange = adjustedPrice < 2000 ? '低価格' : adjustedPrice < 5000 ? '中価格' : '高価格';

      return {
        id: `rec_${Date.now()}_${index}`,
        name: selectedItem.name,
        brand: selectedItem.brand,
        price: `¥${adjustedPrice.toLocaleString()}`,
        priceRange: priceRange,
        category: category,
        categoryDisplay: this.getCategoryDisplayName(category),
        url: `https://example.com/product/${index}`,
        description: `${this.getCategoryDisplayName(category)}のおすすめ商品です。あなたの好みに基づいて選ばれました。`,
        colorHue: preferences.colorHue,
        colorName: this.getColorName(preferences.colorHue),
        matchScore: Math.round(70 + Math.random() * 30), // 70-100のマッチスコア
        preferences: {
          colorHue: preferences.colorHue,
          price: preferences.price,
          silhouetteValue: preferences.silhouetteValue,
          materialValue: preferences.materialValue,
          emotion: preferences.emotion,
          fitValue: preferences.fitValue,
          values: preferences.values
        }
      };

    } catch (error) {
      console.error('おすすめアイテムの作成に失敗しました:', error);
      return this.createDefaultRecommendationItem(index);
    }
  }

  /**
   * デフォルトのおすすめアイテムを作成
   * @param {number} index - アイテムのインデックス
   * @returns {Object} デフォルトアイテム
   */
  createDefaultRecommendationItem(index) {
    const defaultItems = [
      { name: 'ベーシックTシャツ', brand: 'UNIQLO', price: '¥1,500', category: 'tops' },
      { name: 'デニムパンツ', brand: 'UNIQLO', price: '¥3,900', category: 'bottoms' },
      { name: 'デニムジャケット', brand: 'UNIQLO', price: '¥4,900', category: 'outerwear' }
    ];

    const item = defaultItems[index % defaultItems.length];

    return {
      id: `rec_default_${index}`,
      name: item.name,
      brand: item.brand,
      price: item.price,
      priceRange: '中価格',
      category: item.category,
      categoryDisplay: this.getCategoryDisplayName(item.category),
      url: `https://example.com/product/default_${index}`,
      description: `${this.getCategoryDisplayName(item.category)}のおすすめ商品です。`,
      colorHue: 180,
      colorName: 'ブルー',
      matchScore: 75,
      preferences: this.getDefaultPreferences()
    };
  }

  /**
   * デフォルトのおすすめアイテムを生成
   * @param {number} count - 生成するアイテム数
   * @returns {Array} デフォルトアイテムの配列
   */
  generateDefaultRecommendations(count = 3) {
    const recommendations = [];
    for (let i = 0; i < count; i++) {
      recommendations.push(this.createDefaultRecommendationItem(i));
    }
    return recommendations;
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
   * 色相から色名を取得
   * @param {number} hue - 色相値（0-360）
   * @returns {string} 色名
   */
  getColorName(hue) {
    const colorNames = {
      0: 'レッド',
      30: 'オレンジ',
      60: 'イエロー',
      90: 'ライム',
      120: 'グリーン',
      150: 'ティール',
      180: 'シアン',
      210: 'ブルー',
      240: 'インディゴ',
      270: 'パープル',
      300: 'マゼンタ',
      330: 'ピンク'
    };

    // 最も近い色を返す
    const keys = Object.keys(colorNames).map(Number);
    const closest = keys.reduce((prev, curr) => {
      return (Math.abs(curr - hue) < Math.abs(prev - hue) ? curr : prev);
    });

    return colorNames[closest] || 'ブルー';
  }
}

// グローバルインスタンスを作成
window.DataManager = new DataManager(); 