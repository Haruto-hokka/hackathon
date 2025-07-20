/**
 * フォーム管理クラス
 * 
 * 機能:
 * - スライダーの制御とリアルタイム更新
 * - フォームの検証
 * - データの送信と保存
 * - リアルタイムプレビュー
 * - フォームのリセット
 */

class FormManager {
  constructor(app) {
    this.app = app;
    this.form = document.getElementById('clothingForm');
    this.currentItemId = null; // 編集モード用
    this.sliders = {};
    this.init();
  }

  /**
   * フォーム管理の初期化
   */
  init() {
    try {
      this.cacheElements();
      this.setupEventListeners();
      this.initializeSliders();
      this.updateColorPreview();
      
      console.log('フォーム管理を初期化しました');
    } catch (error) {
      console.error('フォーム管理の初期化に失敗しました:', error);
    }
  }

  /**
   * DOM要素のキャッシュ
   */
  cacheElements() {
    this.elements = {
      // 基本情報
      itemName: document.getElementById('itemName'),
      category: document.getElementById('category'),
      brand: document.getElementById('brand'),
      purchaseUrl: document.getElementById('purchaseUrl'),
      
      // スライダー
      colorHue: document.getElementById('colorHue'),
      colorSaturation: document.getElementById('colorSaturation'),
      colorLightness: document.getElementById('colorLightness'),
      silhouette: document.getElementById('silhouette'),
      material: document.getElementById('material'),
      price: document.getElementById('price'),
      fit: document.getElementById('fit'),
      
      // 感情評価スライダー
      colorPreference: document.getElementById('colorPreference'),
      silhouettePreference: document.getElementById('silhouettePreference'),
      materialPreference: document.getElementById('materialPreference'),
      pricePreference: document.getElementById('pricePreference'),
      overallPreference: document.getElementById('overallPreference'),
      
      // 値表示
      colorHueValue: document.getElementById('colorHue-value'),
      colorSaturationValue: document.getElementById('colorSaturation-value'),
      colorLightnessValue: document.getElementById('colorLightness-value'),
      silhouetteValue: document.getElementById('silhouette-value'),
      materialValue: document.getElementById('material-value'),
      priceValue: document.getElementById('price-value'),
      fitValue: document.getElementById('fit-value'),
      colorPreferenceValue: document.getElementById('colorPreference-value'),
      silhouettePreferenceValue: document.getElementById('silhouettePreference-value'),
      materialPreferenceValue: document.getElementById('materialPreference-value'),
      pricePreferenceValue: document.getElementById('pricePreference-value'),
      overallPreferenceValue: document.getElementById('overallPreference-value'),
      
      // プレビュー
      colorPreview: document.getElementById('colorPreview'),
      
      // ボタン
      resetBtn: document.getElementById('resetBtn'),
      saveBtn: document.getElementById('saveBtn'),
      
      // エラーメッセージ
      itemNameError: document.getElementById('itemName-error'),
      categoryError: document.getElementById('category-error')
    };
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // フォーム送信
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitForm();
      });
    }

    // リセットボタン
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.resetForm();
      });
    }

    // 基本情報フィールドの検証
    if (this.elements.itemName) {
      this.elements.itemName.addEventListener('blur', () => {
        this.validateField('itemName');
      });
    }

    if (this.elements.category) {
      this.elements.category.addEventListener('change', () => {
        this.validateField('category');
      });
    }

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.submitForm();
            break;
          case 'r':
            e.preventDefault();
            this.resetForm();
            break;
        }
      }
    });
  }

  /**
   * スライダーの初期化
   */
  initializeSliders() {
    try {
      // カラースライダー
      this.setupSlider('colorHue', 0, 360, 180, '°');
      this.setupSlider('colorSaturation', 0, 100, 70, '%');
      this.setupSlider('colorLightness', 20, 80, 50, '%');
      
      // 詳細情報スライダー
      this.setupSlider('silhouette', 0, 100, 50, '');
      this.setupSlider('material', 0, 100, 50, '');
      this.setupSlider('price', 500, 100000, 5000, '円');
      this.setupSlider('fit', 0, 100, 50, '');
      
      // 感情評価スライダー
      this.setupSlider('colorPreference', -100, 100, 0, '');
      this.setupSlider('silhouettePreference', -100, 100, 0, '');
      this.setupSlider('materialPreference', -100, 100, 0, '');
      this.setupSlider('pricePreference', -100, 100, 0, '');
      this.setupSlider('overallPreference', -100, 100, 0, '');
      
    } catch (error) {
      console.error('スライダーの初期化に失敗しました:', error);
    }
  }

  /**
   * スライダーの設定
   * @param {string} sliderId - スライダーID
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @param {number} defaultValue - デフォルト値
   * @param {string} unit - 単位
   */
  setupSlider(sliderId, min, max, defaultValue, unit) {
    try {
      const slider = this.elements[sliderId];
      const valueElement = this.elements[`${sliderId}Value`];
      
      if (!slider || !valueElement) {
        console.warn(`スライダー ${sliderId} の要素が見つかりません`);
        return;
      }

      // スライダーの設定
      slider.min = min;
      slider.max = max;
      slider.value = defaultValue;
      
      // 初期値の表示
      this.updateSliderValue(sliderId, defaultValue, unit);
      
      // イベントリスナー
      slider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        this.updateSliderValue(sliderId, value, unit);
        
        // 特別な処理
        if (sliderId.startsWith('color')) {
          this.updateColorPreview();
        }
      });
      
      // スライダーをキャッシュ
      this.sliders[sliderId] = {
        element: slider,
        valueElement: valueElement,
        min: min,
        max: max,
        unit: unit
      };
      
    } catch (error) {
      console.error(`スライダー ${sliderId} の設定に失敗しました:`, error);
    }
  }

  /**
   * スライダー値の更新
   * @param {string} sliderId - スライダーID
   * @param {number} value - 値
   * @param {string} unit - 単位
   */
  updateSliderValue(sliderId, value, unit) {
    try {
      const sliderInfo = this.sliders[sliderId];
      if (!sliderInfo) return;

      // 値の表示を更新
      if (sliderId === 'price') {
        sliderInfo.valueElement.textContent = this.app.formatValue(value, 'currency');
      } else {
        sliderInfo.valueElement.textContent = `${value}${unit}`;
      }
      
    } catch (error) {
      console.error(`スライダー値の更新に失敗しました:`, error);
    }
  }

  /**
   * 色プレビューの更新
   */
  updateColorPreview() {
    try {
      const hue = parseInt(this.elements.colorHue.value);
      const saturation = parseInt(this.elements.colorSaturation.value);
      const lightness = parseInt(this.elements.colorLightness.value);
      
      const colorDisplay = this.elements.colorPreview?.querySelector('.color-display');
      if (colorDisplay) {
        colorDisplay.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }
      
    } catch (error) {
      console.error('色プレビューの更新に失敗しました:', error);
    }
  }

  /**
   * フォームの送信
   */
  async submitForm() {
    try {
      // フォームの検証
      if (!this.validateForm()) {
        this.app.showNotification('フォームにエラーがあります。確認してください。', 'error');
        return;
      }

      // データの収集
      const formData = this.collectFormData();
      
      // データの保存
      if (this.currentItemId) {
        // 編集モード
        await this.app.dataManager.updateClothingItem(this.currentItemId, formData);
        this.app.showNotification('アイテムを更新しました', 'success');
      } else {
        // 新規追加モード
        await this.app.dataManager.addClothingItem(formData);
        this.app.showNotification('アイテムを追加しました', 'success');
      }
      
      // 結果タブに切り替え
      this.app.switchTab('results');
      
      // フォームをリセット
      this.resetForm();
      
    } catch (error) {
      console.error('フォームの送信に失敗しました:', error);
      this.app.handleError('フォームの送信に失敗しました', error);
    }
  }

  /**
   * フォームの検証
   * @returns {boolean} 検証結果
   */
  validateForm() {
    let isValid = true;
    
    // 必須フィールドの検証
    isValid = this.validateField('itemName') && isValid;
    isValid = this.validateField('category') && isValid;
    
    return isValid;
  }

  /**
   * フィールドの検証
   * @param {string} fieldName - フィールド名
   * @returns {boolean} 検証結果
   */
  validateField(fieldName) {
    try {
      const field = this.elements[fieldName];
      const errorElement = this.elements[`${fieldName}Error`];
      
      if (!field || !errorElement) return true;
      
      let isValid = true;
      let errorMessage = '';
      
      switch (fieldName) {
        case 'itemName':
          if (!field.value.trim()) {
            isValid = false;
            errorMessage = '商品名を入力してください';
          } else if (field.value.trim().length > 100) {
            isValid = false;
            errorMessage = '商品名は100文字以内で入力してください';
          }
          break;
          
        case 'category':
          if (!field.value) {
            isValid = false;
            errorMessage = 'カテゴリを選択してください';
          }
          break;
          
        case 'purchaseUrl':
          if (field.value && !this.isValidUrl(field.value)) {
            isValid = false;
            errorMessage = '有効なURLを入力してください';
          }
          break;
      }
      
      // エラーメッセージの表示/非表示
      if (isValid) {
        errorElement.textContent = '';
        field.classList.remove('error');
      } else {
        errorElement.textContent = errorMessage;
        field.classList.add('error');
      }
      
      return isValid;
      
    } catch (error) {
      console.error(`フィールド ${fieldName} の検証に失敗しました:`, error);
      return false;
    }
  }

  /**
   * URLの検証
   * @param {string} url - 検証するURL
   * @returns {boolean} 検証結果
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * フォームデータの収集
   * @returns {Object} フォームデータ
   */
  collectFormData() {
    try {
      return {
        name: this.elements.itemName.value.trim(),
        category: this.elements.category.value,
        brand: this.elements.brand.value.trim(),
        purchaseUrl: this.elements.purchaseUrl.value.trim(),
        
        color: {
          hue: parseInt(this.elements.colorHue.value),
          saturation: parseInt(this.elements.colorSaturation.value),
          lightness: parseInt(this.elements.colorLightness.value)
        },
        
        silhouette: parseInt(this.elements.silhouette.value),
        material: parseInt(this.elements.material.value),
        price: parseInt(this.elements.price.value),
        fit: parseInt(this.elements.fit.value),
        
        preferences: {
          color: parseInt(this.elements.colorPreference.value),
          silhouette: parseInt(this.elements.silhouettePreference.value),
          material: parseInt(this.elements.materialPreference.value),
          price: parseInt(this.elements.pricePreference.value),
          overall: parseInt(this.elements.overallPreference.value)
        },
        
        tags: [],
        notes: '',
        imageUrl: '',
        wearCount: 0,
        lastWorn: null
      };
      
    } catch (error) {
      console.error('フォームデータの収集に失敗しました:', error);
      throw error;
    }
  }

  /**
   * フォームのリセット
   */
  resetForm() {
    try {
      // フォームをクリア
      if (this.form) {
        this.form.reset();
      }
      
      // スライダーをデフォルト値にリセット
      Object.keys(this.sliders).forEach(sliderId => {
        const sliderInfo = this.sliders[sliderId];
        if (sliderInfo) {
          sliderInfo.element.value = (sliderInfo.min + sliderInfo.max) / 2;
          this.updateSliderValue(sliderId, sliderInfo.element.value, sliderInfo.unit);
        }
      });
      
      // 色プレビューを更新
      this.updateColorPreview();
      
      // エラーメッセージをクリア
      Object.keys(this.elements).forEach(key => {
        if (key.endsWith('Error')) {
          const errorElement = this.elements[key];
          if (errorElement) {
            errorElement.textContent = '';
          }
        }
      });
      
      // エラークラスを削除
      Object.values(this.elements).forEach(element => {
        if (element && element.classList) {
          element.classList.remove('error');
        }
      });
      
      // 編集モードをリセット
      this.currentItemId = null;
      
      // 保存ボタンのテキストを更新
      if (this.elements.saveBtn) {
        this.elements.saveBtn.innerHTML = '<span class="btn-icon">💾</span>保存';
      }
      
      console.log('フォームをリセットしました');
      
    } catch (error) {
      console.error('フォームのリセットに失敗しました:', error);
    }
  }

  /**
   * フォームにデータを設定（編集モード）
   * @param {Object} item - アイテムデータ
   */
  populateForm(item) {
    try {
      if (!item) return;
      
      // 基本情報
      if (this.elements.itemName) this.elements.itemName.value = item.name || '';
      if (this.elements.category) this.elements.category.value = item.category || '';
      if (this.elements.brand) this.elements.brand.value = item.brand || '';
      if (this.elements.purchaseUrl) this.elements.purchaseUrl.value = item.purchaseUrl || '';
      
      // 色情報
      if (item.color) {
        if (this.elements.colorHue) this.elements.colorHue.value = item.color.hue || 180;
        if (this.elements.colorSaturation) this.elements.colorSaturation.value = item.color.saturation || 70;
        if (this.elements.colorLightness) this.elements.colorLightness.value = item.color.lightness || 50;
      }
      
      // 詳細情報
      if (this.elements.silhouette) this.elements.silhouette.value = item.silhouette || 50;
      if (this.elements.material) this.elements.material.value = item.material || 50;
      if (this.elements.price) this.elements.price.value = item.price || 5000;
      if (this.elements.fit) this.elements.fit.value = item.fit || 50;
      
      // 好み度
      if (item.preferences) {
        if (this.elements.colorPreference) this.elements.colorPreference.value = item.preferences.color || 0;
        if (this.elements.silhouettePreference) this.elements.silhouettePreference.value = item.preferences.silhouette || 0;
        if (this.elements.materialPreference) this.elements.materialPreference.value = item.preferences.material || 0;
        if (this.elements.pricePreference) this.elements.pricePreference.value = item.preferences.price || 0;
        if (this.elements.overallPreference) this.elements.overallPreference.value = item.preferences.overall || 0;
      }
      
      // スライダー値の表示を更新
      Object.keys(this.sliders).forEach(sliderId => {
        const sliderInfo = this.sliders[sliderId];
        if (sliderInfo) {
          this.updateSliderValue(sliderId, sliderInfo.element.value, sliderInfo.unit);
        }
      });
      
      // 色プレビューを更新
      this.updateColorPreview();
      
      // 編集モードを設定
      this.currentItemId = item.id;
      
      // 保存ボタンのテキストを更新
      if (this.elements.saveBtn) {
        this.elements.saveBtn.innerHTML = '<span class="btn-icon">✏️</span>更新';
      }
      
      console.log('フォームにデータを設定しました:', item);
      
    } catch (error) {
      console.error('フォームへのデータ設定に失敗しました:', error);
    }
  }

  /**
   * フォームの状態を取得
   * @returns {Object} フォーム状態
   */
  getFormState() {
    try {
      return {
        isEditing: !!this.currentItemId,
        currentItemId: this.currentItemId,
        hasChanges: this.hasFormChanges(),
        isValid: this.validateForm()
      };
    } catch (error) {
      console.error('フォーム状態の取得に失敗しました:', error);
      return {};
    }
  }

  /**
   * フォームに変更があるかチェック
   * @returns {boolean} 変更の有無
   */
  hasFormChanges() {
    // 将来的に実装（フォームの変更検知）
    return false;
  }

  /**
   * フォームの自動保存
   */
  autoSave() {
    try {
      // 将来的に実装（自動保存機能）
      console.log('自動保存機能は未実装です');
    } catch (error) {
      console.error('自動保存に失敗しました:', error);
    }
  }
} 