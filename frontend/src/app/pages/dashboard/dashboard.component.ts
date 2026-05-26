import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

interface ExchangeRate {
  code: string;
  symbol: string;
  rate: number; // Will be updated dynamically via API
  locale: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, HttpClientModule], // Added HttpClientModule
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  barChartData: any = {
    labels: ['Revenue', 'Expenses', 'Profit'],
    datasets: [{ data: [0, 0, 0], label: 'Financial Metrics' }]
  };

  // State configurations
  selectedFile: File | null = null;
  analysisResult: any = null;
  loading = false;
  isDragging = false;

  selectedCurrencyCode = 'USD';
  
  currencies: ExchangeRate[] = [
    { code: 'USD', symbol: '$', rate: 1.0, locale: 'en-US' },
    { code: 'ZAR', symbol: 'R', rate: 18.0, locale: 'en-ZA' }, // Default fallback rates
    { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
    { code: 'GBP', symbol: '£', rate: 0.79, locale: 'en-GB' }
  ];

  constructor(private apiService: ApiService, private http: HttpClient) {
    Chart.register(...registerables);
  }

  // Fetch real-time exchange rates against USD base currency
  fetchLiveRates() {
    const apiUrl = 'https://open.er-api.com/v6/latest/USD'; 
    
    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        if (response && response.rates) {
          this.currencies.forEach(curr => {
            if (response.rates[curr.code]) {
              curr.rate = response.rates[curr.code];
            }
          });
          console.log('Live conversion rates updated successfully:', this.currencies);
          this.updateChartData();
        }
      },
      error: (err) => {
        console.warn('API call failed. Falling back to safe standard values.', err);
      }
    });
  }

  get currentCurrency(): ExchangeRate {
    return this.currencies.find(c => c.code === this.selectedCurrencyCode) || this.currencies[0];
  }

  getConvertedValue(baseValue: number | undefined): number {
    if (!baseValue) return 0;
    return baseValue * this.currentCurrency.rate;
  }

  formatCurrency(value: number): string {
    const currencyInfo = this.currentCurrency;
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  onCurrencyChange(currencyCode: string) {
    this.selectedCurrencyCode = currencyCode;
    this.updateChartData();
  }

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += this.formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value: any) => {
            const sym = this.currentCurrency.symbol;
            if (value >= 1e6) return sym + (value / 1e6) + 'M';
            if (value >= 1e3) return sym + (value / 1e3) + 'k';
            return sym + value;
          },
          color: '#7f8c8d',
          font: { family: 'Arial', size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#2c3e50', font: { family: 'Arial', size: 12, weight: 'bold' } }
      }
    }
  };

  getRiskClass(riskLevel: string): string {
    if (!riskLevel) return 'risk-low';
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      default: return 'risk-low';
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave() { this.isDragging = false; }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  analyseFile() {
    if (!this.selectedFile) return;
    this.loading = true;
    this.selectedCurrencyCode = 'USD'; // Reset UI selection to report base currency

    this.apiService.uploadFile(this.selectedFile).subscribe({
      next: (uploadResponse: any) => {
        this.apiService.analyseFile(uploadResponse.filename).subscribe({
          next: (analysisResponse) => {
            this.analysisResult = analysisResponse;
            
            // Call the live API to capture market rates
            this.fetchLiveRates();
            
            this.updateChartData();
            this.loading = false;
          },
          error: (error) => { console.error(error); this.loading = false; }
        });
      },
      error: (error) => { console.error(error); this.loading = false; }
    });
  }

  updateChartData() {
    if (!this.analysisResult?.metrics) return;
    const metrics = this.analysisResult.metrics;

    this.barChartData = {
      labels: ['Revenue', 'Expenses', 'Profit'],
      datasets: [
        {
          data: [
            this.getConvertedValue(metrics.revenue?.value),
            this.getConvertedValue(metrics.expenses?.value),
            this.getConvertedValue(metrics.profit?.value)
          ],
          label: 'Financial Metrics',
          backgroundColor: ['#3498db', '#e74c3c', '#2ecc71'],
          borderRadius: 8,
          barPercentage: 0.4,
          categoryPercentage: 0.5
        }
      ]
    };
    this.chart?.update();
  }

  getFormattedFileSize(): string {
    if (!this.selectedFile) return '';
    const bytes = this.selectedFile.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.analysisResult = null;
    this.selectedCurrencyCode = 'USD';
    this.barChartData.datasets[0].data = [0, 0, 0];
    this.chart?.update();
  }
}