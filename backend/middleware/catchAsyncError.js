module.exports = (theFunc) => (req, res, next) => {
    Promise.resolve(theFunc(req,res,next)).catch(next);
};

//controller bata export bhako function pass hunxa as theFunc(name j dida ni bho) if tyo fail bhaye catch garera error dekhaidinxa wait garna chodera
// yo chai aysnc error lai ho eg create garda product name compulsary ho but name field empty bhaye error terminal ma auxa 
//tara server le await garirako rai hunxa so barbad hunxa yo nagare bhane