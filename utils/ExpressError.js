class ExpressError extends Error{

    constructor(status , msg){

        super();
        this.status = status;
        this.msg = msg;

    }
}

module.exports = ExpressError;