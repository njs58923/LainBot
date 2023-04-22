// import contrib from 'blessed-contrib';
// import os from 'os';

// // @ts-ignore
// export const LineElement = contrib.line as any as typeof contrib.Widgets.LineElement

// export class GraphCPUPanel extends LineElement {

//     series: contrib.Widgets.LineData

//     constructor(options?: contrib.Widgets.LineOptions) {
//         super({
//             style: {
//                 text: 'white',
//                 baseline: 'white',
//             },
//             xLabelPadding: 0,
//             xPadding: 0,
//             showLegend: true,
//             wholeNumbersOnly: true,
//             label: 'Carga de CPU (%)',
//             ...options
//         })

//         this.series = {
//             title: 'CPU',
//             x: Array.from({ length: 64 }, (_, i) => i.toString()),
//             y: Array(64).fill(0),
//         }

//         setInterval(() => this.updateGraph(), 1000);

//         // this.on('focus', function (data) {
//         //     this.setContent('AAAAAAA');
//         //     this.render();
//         // });

//         // this.key('enter', function (ch, key) {
//         //     this.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
//         //     this.setLine(1, 'bar');
//         //     this.insertLine(1, 'foo');
//         //     this.render();
//         // });
//     }

//     cpuAverage() {
//         const cpus = os.cpus();
//         let totalIdle = 0;
//         let totalTick = 0;

//         for (const cpu of cpus) {
//             for (const type in cpu.times) {
//                 totalTick += cpu.times[type];
//             }
//             totalIdle += cpu.times.idle;
//         }

//         return 100 - (totalIdle / totalTick) * 100;
//     }

//     updateGraph() {
//         this.series.y.shift();
//         this.series.y.push(this.cpuAverage());
//         this.setData([this.series]);
//         this.screen.render();
//     }
// }