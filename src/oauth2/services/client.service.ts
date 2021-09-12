import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, Types } from 'mongoose';
import { ClientModel } from '@oauth2/schema/client.schema';
import { NewClientDTO } from '@oauth2/dto/newClient.dto';
import { Oauth2Error } from '@oauth2/constants/oauth2.error';

@Injectable()
export class ClientService {
  constructor(@InjectModel(ClientModel.name) private clientModelV2: Model<ClientModel>) {}

  async findClientApp({
    clientId,
    clientSecret
  }: {
    clientId: string;
    clientSecret: string;
  }): Promise<ClientModel & { _id: Types.ObjectId }> {
    const clientApp = await this.clientModelV2.findOne({
      clientId,
      clientSecret
    });

    if (!clientApp) {
      throw new HttpException(Oauth2Error.ClientAppNotFound, HttpStatus.NOT_FOUND);
    }

    return clientApp;
  }

  async checkClientAppExist(clientId: string) {
    const clientApp = await this.clientModelV2.findOne({ clientId });

    if (clientApp) {
      throw new HttpException(Oauth2Error.ClientAppExisted, HttpStatus.FOUND);
    }
  }

  async handleCreateNewClient(newClientDTO: NewClientDTO): Promise<LeanDocument<ClientModel>> {
    const clientAppDoc = new this.clientModelV2(newClientDTO);

    await clientAppDoc.save();

    return clientAppDoc.toJSON();
  }
}
