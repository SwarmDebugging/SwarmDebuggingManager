"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const graphql_request_1 = require("graphql-request");
const extension_1 = require("../extension");
class TaskService {
    constructor(task) {
        this.task = task;
    }
    setTask(task) {
        this.task = task;
    }
    updateTaskTitle(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const title = yield vscode.window.showInputBox({ prompt: "Enter new title for selected task" });
            if (title === undefined) {
                return -1;
            }
            else if (!title) {
                vscode.window.showInformationMessage('new title must be valid');
                return yield this.updateTaskTitle(taskId);
            }
            const query = `mutation taskUpdateTitle($taskId: Long!, $title: String!){
            taskUpdate(taskId: $taskId, title: $title){
                id
            }
        }`;
            const variables = {
                taskId: taskId,
                title: title
            };
            let data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            return 1;
        });
    }
    endTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            //can a developer end a task while in a debugging session?
            const query = `mutation taskDone($taskId: Long!) {
            taskDone(taskId: $taskId){
                done
            }
        }`;
            const variables = {
                taskId: taskId
            };
            let data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            if (data.taskDone.done === true) {
                vscode.window.showInformationMessage('Task marked as done');
                return taskId;
            }
        });
    }
    createTask(currentUser, currentProduct) {
        return __awaiter(this, void 0, void 0, function* () {
            if (currentProduct.getID() < 1) {
                vscode.window.showInformationMessage('No product selected');
                return -1;
            }
            else if (!currentUser.isLoggedIn()) {
                vscode.window.showInformationMessage('You must be logged in to create a new task');
                return -2;
            }
            var taskName = "";
            while (taskName === "") {
                taskName = yield vscode.window.showInputBox({ prompt: 'Enter the name of the new task' });
            }
            if (taskName === undefined) {
                return -3;
            }
            const query = `mutation taskCreate($taskName: String!, $productId: Long!) {
            taskCreate(task: {
                title: $taskName
                done: false
                product: {
                    id: $productId
                }
            }) {
                id
            }
        }`;
            const variables = {
                taskName: taskName,
                productId: currentProduct.getID()
            };
            let data = yield graphql_request_1.request(extension_1.SERVERURL, query, variables);
            if (data.taskCreate.id) {
                return 1;
            }
            return -4;
        });
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=taskService.js.map