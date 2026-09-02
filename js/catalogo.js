// catalogo.js — lista dos layouts disponíveis no site.
//
// Cada entrada é o objeto de contrato exportado como default por um
// módulo em ./layouts/*.js — ver motor.js para o formato exato do
// contrato ({ id, nome, mount, unmount }).
//
// mouse-tracker.js e million-dollar-homepage.js foram implementados
// separadamente contra o contrato definido em motor.js. Os caminhos de
// import são o contrato de localização — não renomear os arquivos nem
// os caminhos.

import mouseTracker from './layouts/mouse-tracker.js';
import millionDollarHomepage from './layouts/million-dollar-homepage.js';
import portaVoz from './layouts/porta-voz.js';

export const catalogo = [
  mouseTracker,
  millionDollarHomepage,
  portaVoz,
];

export default catalogo;
