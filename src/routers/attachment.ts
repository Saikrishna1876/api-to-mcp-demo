import { Router } from "express";
import { getAllTran, softDelete, updateOne, registerFiles } from "../utils/fn";
import attachment, {
  attachmentSchema,
  createUploadMiddleware,
  moduleNamePlural,
} from "../modules/attachment";
import { addSchema } from "../swagger";

const attachmentRouter = Router();

addSchema(moduleNamePlural, attachmentSchema);

attachmentRouter.get("/:row_id/:module_name", getAllTran(attachment));

attachmentRouter.put("/:id", updateOne(attachment));

attachmentRouter.delete("/:id", softDelete(attachment));

attachmentRouter.post(
  "/:row_id/:module_name",
  createUploadMiddleware.array("files"),
  registerFiles(attachment)
);

export default attachmentRouter;
