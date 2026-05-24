import { Component } from '@angular/core';
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

  barChartLabels: string[] = [
  'Revenue',
  'Expenses',
  'Profit'
];

barChartData: any = {
  labels: ['Revenue', 'Expenses', 'Profit'],
  datasets: [
    {
      data: [0, 0, 0],
      label: 'Financial Indicators'
    }
  ]
};

  selectedFile!: File;

  analysisResult: any = null;

  loading = false;

  chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  scales: {
    y: {
      beginAtZero: true,
      max: 2,

      ticks: {
        stepSize: 1
      }
    }
  }
};

  constructor(private apiService: ApiService) {
     Chart.register(...registerables);
  }

  // Handle file selection
  onFileSelected(event: any) {

    this.selectedFile = event.target.files[0];
  }

  // Upload + analyze file
  analyseFile() {

    if (!this.selectedFile) return;

    this.loading = true;

    // Upload first
    this.apiService.uploadFile(this.selectedFile)
      .subscribe({

        next: (uploadResponse: any) => {

          const filename = uploadResponse.filename;

          // Analyse uploaded file
          this.apiService.analyseFile(filename)
            .subscribe({

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

   updateChartData() {

  if (!this.analysisResult) return;

  const insights = this.analysisResult.insights;

  this.barChartData = {
    labels: ['Revenue', 'Expenses', 'Profit'],
    
    datasets: [
    {
      data: [
        insights.revenue_detected ? 1 : 0,
        insights.expense_detected ? 1 : 0,
        insights.profit_detected ? 1 : 0
      ],

      label: 'Financial Indicators',

      borderRadius: 8,
      barPercentage: 0.6,
      categoryPercentage: 0.7
    }
  ]
  };
}
}