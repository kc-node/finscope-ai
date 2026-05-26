import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  barChartData: any = {
    labels: ['Revenue', 'Expenses', 'Profit'],
    datasets: [{ data: [0, 0, 0], label: 'Financial Metrics' }]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  // State
  selectedFile: File | null = null;
  analysisResult: any = null;
  loading = false;
  isDragging = false;

  constructor(private apiService: ApiService) {
    Chart.register(...registerables);
  }

  // File Selection
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Drag Events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  // Analysis Pipeline
  analyseFile() {
    if (!this.selectedFile) return;

    this.loading = true;

    this.apiService.uploadFile(this.selectedFile).subscribe({
      next: (uploadResponse: any) => {
        const filename = uploadResponse.filename;

        this.apiService.analyseFile(filename).subscribe({
          next: (analysisResponse) => {
            this.analysisResult = analysisResponse;
            this.updateChartData();
            this.loading = false;
          },
          error: (error) => {
            console.error(error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Chart Update
  updateChartData() {
    if (!this.analysisResult?.metrics) return;

    const metrics = this.analysisResult.metrics;

    this.barChartData = {
      labels: ['Revenue', 'Expenses', 'Profit'],
      datasets: [
        {
          data: [
            metrics.revenue?.value || 0,
            metrics.expenses?.value || 0,
            metrics.profit?.value || 0
          ],
          label: 'Financial Metrics',
          backgroundColor: ['#3498db', '#e74c3c', '#2ecc71'],
          borderRadius: 8,
          barPercentage: 0.5,
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
    this.barChartData.datasets[0].data = [0, 0, 0];
    this.chart?.update();
  }
}