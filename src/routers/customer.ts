import { Router } from "express";
import {
  createOne,
  createMultiple,
  softDelete,
  getAll,
  updateOne,
  getOne,
} from "../utils/fn";
import customer, {
  customerSchema,
  moduleNamePlural,
} from "../modules/customer";
import { addSchema } from "../swagger";

const customerRouter = Router();

addSchema(moduleNamePlural, customerSchema);

customerRouter.post("/multiple", createMultiple(customer));

customerRouter.post("/", createOne(customer));

customerRouter.get("/", getAll(customer));

customerRouter.get("/:id", getOne(customer));

customerRouter.put("/:id", updateOne(customer));

customerRouter.delete("/:id", softDelete(customer));

export default customerRouter;
