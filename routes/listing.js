const express = require('express')
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require('../utils/ExpressError.js')
const {listingSchema}=require("../schema.js")
const listing =require('../models/listing.js')

const validateListing = async (req,res,next)=>{
    let {error}=listingSchema.validate(req.body)
    if (error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        console.log(errMsg)
        next( new ExpressError(400,errMsg))
    }
    else{
        next()
    }
}

//INDEX ROUTE
router.get('/',wrapAsync(async (req,res)=>{
    let listings = await listing.find()
    res.render("listing/index.ejs",{listings})
}))

//NEW ROUTE

router.get('/new',(req,res)=>{
    res.render("listing/new.ejs")
})

router.post('/',validateListing,wrapAsync(async (req,res)=>{
    
    // if (!title || !description || !image || !price || !location || !country) {
    //     throw new ExpressError(400, "Send Valid Data for Listings");
    // }
    let newListing=new listing(req.body.listings);
    console.log(newListing);
    await newListing.save().then(res=>console.log(res))
    // if (!newListing.description){
    //     throw new ExpressError(400, "Description is missing");
    // }
    // if (!newListing.location){
    //     throw new ExpressError(400, "Location is missing");
    // }
    // if (!newListing.country){
    //     throw new ExpressError(400, "Country is missing");
    // }
    
    res.redirect("/listings")
}))

//EDIT ROUTE

router.get('/:id/edit',wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listings=await listing.findById(id);
    res.render("listing/edit.ejs",{listings})
}))

router.put('/:id',validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let {title,description,image,price,location,country}=req.body;
    let updtListing = await listing.findByIdAndUpdate(id,{...req.body.listings},{runValidators:true},{new:true}).then(res=>console.log(res))
    res.redirect(`/listings/${id}`)
}))

//DELETE ROUTE

router.delete('/:id',wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let delListing = await listing.findByIdAndDelete(id);
    res.redirect('/listings')
}))

//SHOW ROUTE

router.get('/:id',wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listings=await listing.findById(id).populate("reviews");
    res.render("listing/show.ejs",{listings})
}))
 
module.exports=router