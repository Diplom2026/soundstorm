FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom HTTPS-enabled nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy your static site files
COPY . /usr/share/nginx/html

# Expose HTTP and HTTPS
EXPOSE 80
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
