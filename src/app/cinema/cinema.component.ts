import {Component, ElementRef, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CinemaService} from '../services/cinema.service';
import {Location} from '@angular/common';


@Component({
    selector: 'app-cinema',
    templateUrl: './cinema.component.html',
    styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit {
    public villes;
    public cinemas;
    public currentCinema;
    public currentVilles;
    public salles;
    private toggleButton: any;
    private sidebarVisible: boolean;
    public currentProjection: any;
    public selectedTickets: any;
    options = {
        autoClose: false,
        keepAfterRouteChange: false
    };
    public vertp: any;

    constructor( public cinemaService: CinemaService) {
        //this.sidebarVisible = false;
    }

    ngOnInit(): void {
        this.cinemaService.getVilles()
            .subscribe(data => {
                this.villes = data;
            }, err => {
                console.log(err)
            })
        const body = document.getElementsByTagName('app-cinema')[0];
        let navbar = document.getElementsByTagName('app-navbar')[0].children[0];
        navbar.classList.add('navbar-hidden');
        this.toggleButton = navbar.getElementsByClassName('navbar-dark')[0];
    }

    ngOnDestroy() {
        let navbar = document.getElementsByTagName('app-navbar')[0].children[0];
        navbar.classList.remove('navbar-hidden');
    }

    onGetCinemas(v) {

        this.currentVilles = v;
        this.salles=undefined;
        this.cinemaService.getCinemas(v)
            .subscribe(data => {
                this.cinemas = data;
            }, err => {
                console.log(err)
            })
    }

    onGetSalles(c) {
        this.currentCinema = c;
        this.cinemaService.getSalles(c)
            .subscribe(data => {
                this.salles = data;
                this.salles._embedded.salles.forEach(salle => {
                    this.cinemaService.getProjections(salle)
                        .subscribe(data => {
                            salle.projections = data;
                        }, err => {
                            console.log(err)
                        })
                })
            }, err => {
                console.log(err)
            })
    }

    onGetTicketPlaces(p) {
        this.currentProjection = p;
        this.cinemaService.getTicketPlaces(p)
            .subscribe(data => {
                this.currentProjection.tickets = data;
                this.selectedTickets=[];
            }, err => {
                console.log(err)
            })
    }

    onSelectTicket(t) {
        if (!t.selected){
            t.selected=true;
            this.selectedTickets.push(t);
        }else {
            t.selected=false;
            this.selectedTickets.splice(this.selectedTickets.indexOf(t),1)
        }
        console.log(this.selectedTickets)

    }

    getTicketClass(t) {
        let str="btn ticket";
        if (t.reserve==true){
            str+="btn btn-danger ticket";
        }
        else if (t.selected){
            str+="btn btn-warning ticket"
        }
        else {
            str+="btn btn-default ticket"
        }
        return str;

    }

    onPayTickets(dataForm) {
        let tickets=[];
        this.selectedTickets.forEach(t=>{
            tickets.push(t.id)
        });

        dataForm.tickets=tickets;
        this.cinemaService.payerTickets(dataForm)
            .subscribe(data => {
                alert("Payement efféctué avec succés !");
                this.onGetTicketPlaces(this.currentProjection);
            }, err => {
                console.log(err)
            })

    }
}
