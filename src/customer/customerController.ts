import { Response } from "express";
import { Request } from "express-jwt";
import customerModel from "./customerModel";

export default class CustomerController {
  getCustomer = async (req: Request, res: Response) => {
    const { sub: userId, firstname, lastname, email } = req.auth;
    //todo add service implement
    const customer = await customerModel.findOne({ userId });
    if (!customer) {
      const newCustomer = await customerModel.create({
        userId,
        firstname,
        lastname,
        email,
        address: [],
      });
      //todo add logger
      return res.json(newCustomer);
    }
    res.json(customer);
  };

  addAddress = async (req: Request, res: Response) => {
    const { sub: userId } = req.auth;
    console.log(req.body);
    //todo add service implement
    const customer = await customerModel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: userId,
      },
      {
        $push: {
          address: {
            text: req.body.address,
            isDefault: false,
          },
        },
      },
      { new: true },
    );
    //todo add logger
    res.json(customer)
  };
}
