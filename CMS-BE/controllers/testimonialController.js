const Testimonial = require('../models/Testimonial');
const fs = require('fs');
const path = require('path');

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    
    // Add full URL to photos
    const testimonialsWithUrls = testimonials.map(testimonial => {
      const testimonialObj = testimonial.toObject();
      if (testimonialObj.photo) {
        testimonialObj.photoUrl = `${req.protocol}://${req.get('host')}/uploads/testimonials/${testimonialObj.photo}`;
      }
      return testimonialObj;
    });
    
    console.log('Testimonials with URLs:', testimonialsWithUrls); // Debugging
    res.status(200).json(testimonialsWithUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

const addTestimonial = async (req, res) => {
  try {
    // Check if the request body is an array
    if (Array.isArray(req.body)) {
      // Save multiple testimonials
      const testimonials = await Testimonial.insertMany(req.body);
      res.status(201).json(testimonials);
    } else {
      // Save a single testimonial
      const { fullName, rating, testimonialText, date, companyName, otherFields } = req.body;
      
      // Handle file upload
      let photo = null;
      if (req.file) {
        photo = req.file.filename;
        console.log('File uploaded:', req.file);
      } else {
        console.log('No file uploaded. Request body:', req.body);
        console.log('Request headers:', req.headers['content-type']);
      }

      const testimonial = new Testimonial({
        fullName,
        rating,
        testimonialText,
        photo,
        date: date || new Date(),
        companyName,
        otherFields,
      });

      const savedTestimonial = await testimonial.save();
      
      // Add full URL to the photo if it exists
      if (savedTestimonial.photo) {
        savedTestimonial.photoUrl = `${req.protocol}://${req.get('host')}/uploads/testimonials/${savedTestimonial.photo}`;
      }
      
      res.status(201).json(savedTestimonial);
    }
  } catch (error) {
    console.error('Error in addTestimonial:', error);
    res.status(400).json({ message: 'Bad Request', error: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    // Find existing testimonial
    const existingTestimonial = await Testimonial.findById(req.params.id);
    if (!existingTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Handle file upload
    let photo = existingTestimonial.photo;
    if (req.file) {
      // Delete old photo if exists
      if (existingTestimonial.photo) {
        const oldPhotoPath = path.join(__dirname, '../uploads/testimonials', existingTestimonial.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      photo = req.file.filename;
    }

    const updateData = {
      ...req.body,
      photo
    };

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Add full URL to the photo if it exists
    if (updatedTestimonial.photo) {
      updatedTestimonial.photoUrl = `${req.protocol}://${req.get('host')}/uploads/testimonials/${updatedTestimonial.photo}`;
    }

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete photo file if exists
    if (testimonial.photo) {
      const photoPath = path.join(__dirname, '../uploads/testimonials', testimonial.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
};