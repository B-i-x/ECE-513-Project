EC2 stuff: 

http://ec2-54-151-120-233.us-west-1.compute.amazonaws.com:3000/

curl -X POST http://ec2-54-151-120-233.us-west-1.compute.amazonaws.com:3000/device/start/ \
-H "Content-Type: application/json" \
-d '{"message": "hello"}'