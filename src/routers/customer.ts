import { Router } from "express";
import { createOne, createMultiple, softDelete, getAll } from "../utils/fn";
import customer, {
  customerSchema,
  moduleNamePlural,
} from "../modules/customer";
import { addSchema } from "../swagger";

const customerRouter = Router();

addSchema(moduleNamePlural, customerSchema);

customerRouter.post("/multiple", createMultiple(customer));

customerRouter.get("/", getAll(customer));

customerRouter.post("/", createOne(customer));

customerRouter.delete("/:id", softDelete(customer));

export default customerRouter;
