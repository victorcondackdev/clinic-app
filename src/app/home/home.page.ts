import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  MENSAGEM_CANCELAR = 'Cancelar';

  dadosPressao: any[] = [];
  mediaMaxima: number | undefined;
  mediaMinima: number | undefined;
  dadosExibidos: boolean = false;

  constructor(public alertController: AlertController, private http: HttpClient) {}


  ngOnInit() {
    this.exibirDados();
  }

  async adicionarDados() {
    const alert = await this.criarAlerta('Adicionar Dados', [
      { name: 'dia', type: 'text', placeholder: 'Dia (YYYY-MM-DD)' },
      { name: 'hora', type: 'text', placeholder: 'Hora (HH:MM)' },
      { name: 'pressaoMax', type: 'number', placeholder: 'Pressão Máxima' },
      { name: 'pressaoMin', type: 'number', placeholder: 'Pressão Mínima' },
    ]);

    await alert.present();
  }

  async criarAlerta(header: string, inputs: any[]) {
    return await this.alertController.create({
      header,
      inputs,
      buttons: [
        { text: this.MENSAGEM_CANCELAR, role: 'cancel', handler: () => console.log('Cancelado') },
        { text: 'Adicionar', handler: (data) => this.validarEAdicionarDados(data) },
      ],
    });
  }

  validarEAdicionarDados(data: any) {
    if (this.camposObrigatoriosPreenchidos(data)) {
      this.http.post('http://localhost:3000/api/dados-pressao', data).subscribe(
        (response: any) => {
          this.exibirMensagem('Dados adicionados com sucesso.');
          this.exibirDados(); // Refresh data after adding
        },
        (error) => {
          console.error('Error adding data:', error);
          this.exibirMensagem('Erro ao adicionar dados.');
        }
      );
    } else {
      this.exibirMensagem('Campos obrigatórios não preenchidos.');
    }
  }

  camposObrigatoriosPreenchidos(data: any): boolean {
    return data.dia && data.hora && data.pressaoMax && data.pressaoMin;
  }

  atualizarMedias() {
    const totalMax = this.dadosPressao.reduce((sum, data) => sum + data.pressaoMax, 0);
    const totalMin = this.dadosPressao.reduce((sum, data) => sum + data.pressaoMin, 0);

    this.mediaMaxima = totalMax / this.dadosPressao.length;
    this.mediaMinima = totalMin / this.dadosPressao.length;
  }
  dadosExibir(id: string) {
    this.dadosExibidos = true;
}
  async exibirDados() {
    this.http.get<any[]>('http://localhost:3000/api/dados-pressao').subscribe(
      (data: any[]) => {
        this.dadosPressao = data;
      },
      (error) => {
        console.error('Error retrieving data:', error);
        this.exibirMensagem('Erro ao recuperar dados.');
      }
    );
  }

  async apagarInformacoes(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza de que deseja apagar todas as informações?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => console.log('Cancelado'),
        },
        {
          text: 'Apagar',
          handler: () => this.apagarDados(id), // Passe o ID para a função apagarDados()
        },
      ],
    });

    await alert.present();
  }

  apagarDados(id: string) {
    this.http.delete(`http://localhost:3000/api/dados-pressao/${id}`).subscribe(
      (response: any) => {
        console.log('Tipo de dados da resposta:', typeof response, response);

        if (response && response.success === true) {
          this.dadosPressao = this.dadosPressao.filter(data => data.id !== id);
          this.atualizarMedias();
          this.exibirMensagem('Dados apagados com sucesso.');
          window.location.reload();
        } else {
          console.error('Erro ao apagar dados:', response);
          this.exibirMensagem('Erro ao apagar dados.');
        }
      },
      (error) => {
        console.error('Erro ao apagar dados:', error);
        this.exibirMensagem('Erro ao apagar dados.');
      }
    );
  }

  async alterarValor(id: string) {
    const alert = await this.alertController.create({
      header: 'Alterar Valor',
      inputs: [
        { name: 'dia', type: 'text', placeholder: 'Novo Dia' },
        { name: 'hora', type: 'text', placeholder: 'Nova Hora' },
        { name: 'pressaoMax', type: 'number', placeholder: 'Nova Pressão Máxima' },
        { name: 'pressaoMin', type: 'number', placeholder: 'Nova Pressão Mínima' },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => console.log('Cancelado')
        },
        {
          text: 'Alterar',
          handler: (data) => {
            this.validarEAlterarValor({ id, ...data });
          }
        }
      ]
    });

    await alert.present();
  }

  async validarEAlterarValor(data: any) {
    console.log('validarEAlterarValor chamada com data:', data);

    const id = data.id;

    if (id) {
      const dataToUpdate = {
        pressaoMax: data.pressaoMax,
        pressaoMin: data.pressaoMin,
        dia: data.dia,
        hora: data.hora
      };

      (this.http.put(`http://localhost:3000/api/dados-pressao/${id}`, dataToUpdate)).subscribe(
        (response: any) => {

          if (response && response.success === true) {
            this.exibirMensagem('Dados atualizados com sucesso.');
            window.location.reload();

            // Atualize diretamente os dadosPressao
            const index = this.dadosPressao.findIndex(item => item.id === id);

            if (index !== -1) {
              this.dadosPressao[index].pressaoMax = data.pressaoMax;
              this.dadosPressao[index].pressaoMin = data.pressaoMin;
              this.dadosPressao[index].dia = data.dia;
              this.dadosPressao[index].hora = data.hora;
            } else {
              console.error('Item não encontrado para o ID:', id);
            }
          } else {
            console.error('Erro ao atualizar dados:', response);
            this.exibirMensagem('Erro ao atualizar dados.');
          }
        },
        (error) => {
          console.error('Erro ao atualizar dados:', error);
          this.exibirMensagem('Erro ao atualizar dados.');
        }
      );

      }
    }


  exibirMensagem(mensagem: string) {
    this.alertController.create({
      header: 'Aviso',
      message: mensagem,
      buttons: ['OK'],
    }).then(alert => alert.present());
  }
}
