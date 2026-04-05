<script setup lang="ts">
import { fuelTypeOptions } from '@/constants/fuel';
import { useRouteRecommendations } from '@/composables/useRouteRecommendations';

const {
  form,
  loading,
  error,
  recommendations,
  loadRecommendations,
} = useRouteRecommendations();

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatDecimal(value: number, digits = 1) {
  return value.toFixed(digits);
}
</script>

<template>
  <section class="route-panel">
    <h2 class="panel-title">경로 기반 주유소 추천</h2>

    <div class="form-grid">
      <label>
        <span>출발지 위도</span>
        <input v-model.number="form.originLatitude" type="number" step="any" />
      </label>

      <label>
        <span>출발지 경도</span>
        <input v-model.number="form.originLongitude" type="number" step="any" />
      </label>

      <label>
        <span>도착지 위도</span>
        <input v-model.number="form.destinationLatitude" type="number" step="any" />
      </label>

      <label>
        <span>도착지 경도</span>
        <input v-model.number="form.destinationLongitude" type="number" step="any" />
      </label>

      <label>
        <span>유종</span>
        <select v-model="form.fuelType">
          <option
            v-for="option in fuelTypeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label>
        <span>주유량(L)</span>
        <input v-model.number="form.refuelLiters" type="number" min="1" step="1" />
      </label>

      <label>
        <span>연비(km/L)</span>
        <input v-model.number="form.fuelEfficiency" type="number" min="0.1" step="0.1" />
      </label>

      <label>
        <span>추천 개수</span>
        <input v-model.number="form.limit" type="number" min="1" max="5" step="1" />
      </label>
    </div>

    <div class="action-row">
      <button class="search-btn" :disabled="loading" @click="loadRecommendations">
        {{ loading ? '조회 중...' : '추천 받기' }}
      </button>
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>

    <div v-if="recommendations.length > 0" class="result-list">
      <article
        v-for="item in recommendations"
        :key="item.id"
        class="result-card"
      >
        <div class="result-header">
          <strong class="rank-badge">{{ item.rank }}위</strong>
          <div>
            <h3 class="station-name">{{ item.name }}</h3>
            <p class="brand-text">{{ item.brand }}</p>
          </div>
        </div>

        <div class="info-grid">
          <p><span>가격</span><strong>{{ formatNumber(item.price) }}원</strong></p>
          <p><span>거리</span><strong>{{ formatDecimal(item.distance) }} km</strong></p>
          <p><span>우회거리</span><strong>{{ formatDecimal(item.detourDistance) }} km</strong></p>
          <p><span>점수</span><strong>{{ formatDecimal(item.score, 2) }}</strong></p>
          <p><span>전방 도로 속도</span><strong>{{ formatDecimal(item.frontRoadSpeed) }}</strong></p>
          <p><span>주유소 ID</span><strong>{{ item.id }}</strong></p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.route-panel {
  padding: 20px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.panel-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-grid span {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.form-grid input,
.form-grid select {
  height: 44px;
  padding: 0 12px;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
}

.form-grid input:focus,
.form-grid select:focus {
  border-color: #111;
}

.action-row {
  margin-top: 16px;
}

.search-btn {
  height: 46px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  margin-top: 12px;
  color: #d93025;
  font-size: 14px;
}

.result-list {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.result-card {
  padding: 18px;
  border: 1px solid #ededed;
  border-radius: 16px;
  background: #fafafa;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  background: #111;
  color: white;
  font-size: 13px;
}

.station-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.brand-text {
  margin: 4px 0 0;
  color: #666;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.info-grid p {
  margin: 0;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  font-size: 14px;
}

.info-grid span {
  color: #666;
}

.info-grid strong {
  color: #111;
}

@media (max-width: 768px) {
  .form-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>