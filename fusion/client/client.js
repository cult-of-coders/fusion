import { DDP, LivedataTest } from '../../common/namespace';
import FusionModel from './fusion';

import '../../client/stream_client_sockjs';
import '../../common/livedata_connection';

import { engage, disengage } from './engager';
disengage();

DDP.engage = engage;
DDP.disengage = disengage;

const Fusion = new FusionModel();

export { DDP, LivedataTest, Fusion }
