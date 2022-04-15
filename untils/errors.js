function Error(err){
    let error = err.toString().slice(23);
        switch(error){
            case 'transaction underpriced':
                return "gasprice错误";
                break;
            case 'intrinsic gas too low':
                return 'gasLimit错误';
                break ;
            default:
                return '其他错误'
        };
}
module.exports = Error;