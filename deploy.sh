#!/bin/bash
gulp build
scp -r dist/* root@thoster.net:/root/server-setup/www/wordpress/adventex
