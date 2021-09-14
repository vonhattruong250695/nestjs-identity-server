import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { ClientTokenModel } from '@oauth2/schema/client-token.schema';
import { NewClientTokenDTO } from '@oauth2/dto/newClient-token.dto';

@Injectable()
export class ClientTokenService {
  constructor(
    @InjectModel(ClientTokenModel.name) private clientTokenModel: Model<ClientTokenModel>
  )
  {}

  async createNewClientToken(
    newClientTokenDTO: NewClientTokenDTO
  ): Promise<LeanDocument<ClientTokenModel>> {
    const clientTokenDoc = new this.clientTokenModel(newClientTokenDTO);

    await clientTokenDoc.save();

    return clientTokenDoc.toJSON();
  }
}
